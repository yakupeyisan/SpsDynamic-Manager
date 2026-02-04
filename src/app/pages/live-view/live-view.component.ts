// LiveView Component
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

// Import configurations
import { tableColumns } from './live-view-table-columns';

// Import types from DataTableComponent
import { 
  DataTableComponent, 
  TableColumn, 
  ToolbarConfig, 
  GridResponse,
  ColumnType
} from 'src/app/components/data-table/data-table.component';
import { LiveViewStorageService } from 'src/app/services/live-view-storage.service';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { SelectComponent } from 'src/app/components/select/select.component';

@Component({
  selector: 'app-live-view',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule, 
    FormsModule,
    TablerIconsModule,
    TranslateModule,
    DataTableComponent,
    ModalComponent,
    SelectComponent
  ],
  templateUrl: './live-view.component.html',
  styleUrls: ['./live-view.component.scss']
})
export class LiveViewComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  
  // Table configuration
  tableColumns: TableColumn[] = tableColumns;
  
  // Live view state (synced from LiveViewStorageService)
  isLiveViewEnabled: boolean = false;
  recordHeight: number = 100;
  
  // Filter modal
  showFilterModal: boolean = false;
  showRowSizeModal: boolean = false;
  liveViewSettings: any[] = [];
  selectedLiveViewSettingId: number | null = null;
  newRowSize: number = 100;
  currentReaderList: number[] = []; // Store readerList for WebSocket
  selectedTerminals: any[] = []; // Selected terminals from API
  terminalsTableColumns: TableColumn[] = [
    { 
      field: 'ReaderID', 
      label: 'ID', 
      text: 'ID',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '80px', 
      size: '80px',
      searchable: 'int',
      resizable: true
    },
    { 
      field: 'SerialNumber', 
      label: 'Seri Numarası', 
      text: 'Seri Numarası',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'ReaderName', 
      label: 'Terminal Adı', 
      text: 'Terminal Adı',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '300px', 
      size: '300px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'IpAddress', 
      label: 'IP Adresi', 
      text: 'IP Adresi',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'text',
      resizable: true
    }
  ];
  
  // Subscriptions to storage service (for UI updates only; storage runs in service)
  private storedRecordsSubscription?: Subscription;
  private isActiveSubscription?: Subscription;
  
  // Throttle grid reload when new records arrive
  private reloadThrottleMs = 150;
  private lastReloadAt = 0;
  private pendingReloadId: ReturnType<typeof setTimeout> | null = null;
  
  // Data source - synced from LiveViewStorageService (shows stored records when returning to page)
  liveViewRecords: any[] = [];
  
  // Data source function for table
  tableDataSource = (params: any) => {
    // Return live view records
    return of({
      status: 'success' as const,
      total: this.liveViewRecords.length,
      records: this.liveViewRecords
    } as GridResponse);
  };

  // Toolbar configuration
  get tableToolbarConfig(): ToolbarConfig {
    return {
      items: [
        {
          type: 'break' as const,
          id: 'break-settings-menu'
        },
        {
          id: 'settings',
          type: 'menu' as const,
          text: 'Ayarlar',
          icon: 'fa fa-cog',
          items: [
            {
              id: 'recordSize',
              text: 'Satır Yüksekliği',
              onClick: (event: MouseEvent, item: any) => this.onSetRowSize(event, item)
            },
            {
              id: 'filterRecord',
              text: 'Filtrele',
              onClick: (event: MouseEvent, item: any) => this.onFilterByGroup(event, item)
            }
          ]
        }
      ],
      show: {
        reload: false,
        columns: true,
        search: true,
        add: false,
        edit: false,
        delete: false,
        save: false
      }
    };
  }

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private liveViewStorage: LiveViewStorageService
  ) {}

  ngOnInit(): void {
    this.loadLiveViewSettings();
    // Load stored records (e.g. when returning to live view page)
    this.liveViewRecords = this.liveViewStorage.getStoredRecords();
    this.isLiveViewEnabled = this.liveViewStorage.getIsActive();
    this.currentReaderList = this.liveViewStorage.getCurrentReaderList();
    // Subscribe to storage updates (new records arrive even when user was on another page)
    this.storedRecordsSubscription = this.liveViewStorage.getStoredRecords$().subscribe(records => {
      this.liveViewRecords = records;
      this.scheduleReload();
    });
    this.isActiveSubscription = this.liveViewStorage.getIsActive$().subscribe(active => {
      this.isLiveViewEnabled = active;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.clearReloadThrottle();
    if (this.storedRecordsSubscription) {
      this.storedRecordsSubscription.unsubscribe();
    }
    if (this.isActiveSubscription) {
      this.isActiveSubscription.unsubscribe();
    }
    // Do NOT call liveViewStorage.stopLiveView() here so background storage continues when user navigates away
  }

  /**
   * Toggle live view on/off. When on, storage service stores messages in background (even when user leaves page).
   */
  toggleLiveView(enabled: boolean): void {
    this.isLiveViewEnabled = enabled;
    if (enabled) {
      let readerList: number[] = this.currentReaderList;
      if (readerList.length === 0 && this.selectedTerminals?.length > 0) {
        readerList = this.selectedTerminals.map((t: any) =>
          parseInt(t.SerialNumber || t.serialNumber || '0')
        ).filter((num: number) => !isNaN(num) && num > 0);
      }
      this.liveViewStorage.startLiveView(readerList.length ? readerList : this.currentReaderList);
    } else {
      this.liveViewStorage.stopLiveView();
    }
  }

  /**
   * Throttled grid reload + change detection (no loading, no scroll-to-top).
   */
  private scheduleReload(): void {
    const now = Date.now();
    const elapsed = now - this.lastReloadAt;

    const runReload = () => {
      this.pendingReloadId = null;
      this.lastReloadAt = Date.now();
      if (this.dataTableComponent) this.dataTableComponent.reload();
      this.cdr.detectChanges();
    };

    if (elapsed >= this.reloadThrottleMs || this.lastReloadAt === 0) {
      if (this.pendingReloadId) {
        clearTimeout(this.pendingReloadId);
        this.pendingReloadId = null;
      }
      runReload();
    } else if (!this.pendingReloadId) {
      this.pendingReloadId = setTimeout(() => runReload(), this.reloadThrottleMs - elapsed);
    }
  }

  private clearReloadThrottle(): void {
    if (this.pendingReloadId) {
      clearTimeout(this.pendingReloadId);
      this.pendingReloadId = null;
    }
  }

  /**
   * Load LiveView settings for filter
   */
  private loadLiveViewSettings(): void {
    this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/LiveViewSettings`, {
      limit: -1,
      offset: 0
    }).pipe(
      map((response: GridResponse) => {
        this.liveViewSettings = (response.records || []).map((item: any) => ({
          label: item.Name || '',
          value: item.Id || item.id
        }));
        return response;
      }),
      catchError(error => {
        console.error('Error loading live view settings:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    ).subscribe();
  }

  /**
   * Set row size
   */
  onSetRowSize(event: MouseEvent, item: any): void {
    this.newRowSize = this.recordHeight;
    this.showRowSizeModal = true;
  }

  /**
   * Apply row size
   */
  onApplyRowSize(): void {
    if (this.newRowSize > 0) {
      this.recordHeight = this.newRowSize;
      if (this.dataTableComponent) {
        this.dataTableComponent.reload();
      }
    }
    this.showRowSizeModal = false;
  }

  /**
   * Filter by group
   */
  onFilterByGroup(event: MouseEvent, item: any): void {
    this.selectedLiveViewSettingId = null;
    this.selectedTerminals = [];
    this.showFilterModal = true;
  }

  /**
   * Handle live view setting selection change
   * Only load terminals for display, don't send to WebSocket yet
   */
  onLiveViewSettingChange(): void {
    if (!this.selectedLiveViewSettingId) {
      this.selectedTerminals = [];
      this.cdr.detectChanges();
      return;
    }

    // Load terminals for selected live view setting (just for display)
    this.http.post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/GetSelectedByLiveViewSettingId`, {
      LiveViewSettingId: this.selectedLiveViewSettingId
    }).pipe(
      map((response: any) => {
        // Handle different response formats
        let terminals: any[] = [];
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          terminals = response.data.data;
        } else if (response.records && Array.isArray(response.records)) {
          terminals = response.records;
        } else if (response.data && Array.isArray(response.data)) {
          terminals = response.data;
        } else if (Array.isArray(response)) {
          terminals = response;
        }
        return terminals;
      }),
      catchError(error => {
        console.error('Error loading terminals:', error);
        this.toastr.error('Terminal listesi yüklenirken hata oluştu', 'Hata');
        return of([]);
      })
    ).subscribe(terminals => {
      this.selectedTerminals = terminals || [];
      this.cdr.detectChanges();
    });
  }

  /**
   * Data source for terminals table in filter modal
   */
  terminalsDataSource = (params: any) => {
    return of({
      status: 'success' as const,
      total: this.selectedTerminals.length,
      records: this.selectedTerminals
    } as GridResponse);
  };

  /**
   * Toolbar config for terminals table (read-only, no actions)
   */
  get terminalsTableToolbarConfig(): ToolbarConfig {
    return {
      items: [],
      show: {
        reload: false,
        columns: false,
        search: false,
        add: false,
        edit: false,
        delete: false,
        save: false
      }
    };
  }

  /**
   * Apply filter - Load terminals and send to WebSocket when "Tamam" is clicked
   */
  onApplyFilter(): void {
    if (!this.selectedLiveViewSettingId) {
      this.toastr.warning('Lütfen bir grup seçin', 'Uyarı');
      return;
    }

    // Load terminals for selected live view setting (like old system onSave)
    this.http.post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/GetSelectedByLiveViewSettingId`, {
      LiveViewSettingId: this.selectedLiveViewSettingId
    }).pipe(
      map((response: any) => {
        // Handle different response formats (like old system: event.xhr.responseJSON.data.data)
        let terminals: any[] = [];
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          terminals = response.data.data;
        } else if (response.records && Array.isArray(response.records)) {
          terminals = response.records;
        } else if (response.data && Array.isArray(response.data)) {
          terminals = response.data;
        } else if (Array.isArray(response)) {
          terminals = response;
        }
        
        // Store terminals for display
        this.selectedTerminals = terminals || [];
        
        // Extract SerialNumber array (like old system: datas[index]=el.SerialNumber)
        const readerList = terminals.map((terminal: any) => {
          return parseInt(terminal.SerialNumber || terminal.serialNumber || '0');
        }).filter((num: number) => !isNaN(num) && num > 0);
        
        return readerList;
      }),
      catchError(error => {
        console.error('Error loading terminals:', error);
        this.toastr.error('Terminal listesi yüklenirken hata oluştu', 'Hata');
        return of([]);
      })
    ).subscribe(readerList => {
      // Store readerList
      this.currentReaderList = readerList || [];
      
      //console.log('ReaderList loaded and sending to WebSocket:', this.currentReaderList);
      
      // Close modal
      this.showFilterModal = false;
      this.cdr.detectChanges();
      
      // Start/restart live view with new readerList (storage service keeps storing in background)
      if (this.liveViewStorage.getIsActive()) {
        this.liveViewStorage.startLiveView(this.currentReaderList);
      } else {
        this.isLiveViewEnabled = true;
        this.liveViewStorage.startLiveView(this.currentReaderList);
        this.toastr.success(`${this.currentReaderList.length} terminal için filtre uygulandı ve canlı izleme başlatıldı`, 'Başarılı');
      }
    });
  }

  /**
   * Close filter modal
   */
  onCloseFilterModal(): void {
    this.showFilterModal = false;
    this.selectedLiveViewSettingId = null;
    this.selectedTerminals = [];
  }

  /**
   * Close row size modal
   */
  onCloseRowSizeModal(): void {
    this.showRowSizeModal = false;
  }

  // Event handlers
  onTableRowClick(event: any): void {
    // Handle row click
  }

  onTableRowDblClick(event: any): void {
    // Handle row double click
  }

  onTableRowSelect(event: any): void {
    // Handle row selection
  }

  onTableRefresh(): void {
    // Handle refresh
    if (this.dataTableComponent) {
      this.dataTableComponent.reload();
    }
  }

  onTableDelete(event: any): void {
    // Not applicable
  }

  onTableAdd(): void {
    // Not applicable
  }

  onTableEdit(event: any): void {
    // Not applicable
  }

  onAdvancedFilterChange(event: any): void {
    // Handle advanced filter change
  }
}
