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
  GridResponse
} from 'src/app/components/data-table/data-table.component';
import { WebSocketService } from 'src/app/services/websocket.service';
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
  
  // Live view state
  isLiveViewEnabled: boolean = false;
  recordCount: number = 1;
  recordHeight: number = 100;
  
  // Filter modal
  showFilterModal: boolean = false;
  showRowSizeModal: boolean = false;
  liveViewSettings: any[] = [];
  selectedLiveViewSettingId: number | null = null;
  newRowSize: number = 100;
  
  // WebSocket subscription
  private wsSubscription?: Subscription;
  private connectionStatusSubscription?: Subscription;
  
  // Data source - empty initially, will be populated by WebSocket
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
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.loadLiveViewSettings();
  }

  ngOnDestroy(): void {
    // Unsubscribe from WebSocket
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.connectionStatusSubscription) {
      this.connectionStatusSubscription.unsubscribe();
    }
    // Note: We don't disconnect WebSocketService as it's a global service used by other components
  }

  /**
   * Toggle live view on/off
   */
  toggleLiveView(enabled: boolean): void {
    this.isLiveViewEnabled = enabled;
    
    if (enabled) {
      this.startLiveView();
    } else {
      this.stopLiveView();
    }
  }

  /**
   * Start live view with WebSocket connection
   */
  private startLiveView(): void {
    // Get reader list from selected live view setting
    let readerList: number[] = [];
    
    if (this.selectedLiveViewSettingId) {
      // Get terminals for selected live view setting
      this.http.post<any>(`${environment.apiUrl}/api/Terminals/GetSelectedByLiveViewSettingId`, {
        LiveViewSettingId: this.selectedLiveViewSettingId
      }).pipe(
        map((response: any) => {
          if (response.data && response.data.data) {
            return response.data.data.map((item: any) => parseInt(item.SerialNumber));
          }
          return [];
        }),
        catchError(error => {
          console.error('Error loading terminals:', error);
          return of([]);
        })
      ).subscribe(serialNumbers => {
        readerList = serialNumbers;
        this.connectWebSocket(readerList);
      });
    } else {
      // No filter, connect with empty reader list
      this.connectWebSocket([]);
    }
  }

  /**
   * Connect to WebSocket
   */
  private connectWebSocket(readerList: number[]): void {
    // Send clientconnect message to WebSocket
    this.wsService.sendMessage({
      type: 'clientconnect',
      readerList: readerList
    });
    
    // Subscribe to messages
    this.wsSubscription = this.wsService.getMessages().subscribe((data: any) => {
      if (data.EmployeeID != undefined) {
        // New access event - add to grid
        data['Id'] = this.recordCount++;
        this.liveViewRecords.unshift(data); // Add to beginning
        
        // Limit to 50 records (like old system)
        if (this.liveViewRecords.length > 50) {
          this.liveViewRecords = this.liveViewRecords.slice(0, 50);
        }
        
        // Refresh grid
        if (this.dataTableComponent) {
          this.dataTableComponent.reload();
        }
        
        this.cdr.detectChanges();
      }
    });
    
    // Subscribe to connection status
    this.connectionStatusSubscription = this.wsService.getConnectionStatus().subscribe((connected: boolean) => {
      if (!connected && this.isLiveViewEnabled) {
        this.toastr.warning('WebSocket bağlantısı kesildi');
      }
    });
  }

  /**
   * Stop live view
   */
  private stopLiveView(): void {
    // Unsubscribe from WebSocket messages
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
      this.wsSubscription = undefined;
    }
    
    if (this.connectionStatusSubscription) {
      this.connectionStatusSubscription.unsubscribe();
      this.connectionStatusSubscription = undefined;
    }
  }

  /**
   * Load LiveView settings for filter
   */
  private loadLiveViewSettings(): void {
    this.http.post<GridResponse>(`${environment.apiUrl}/api/LiveViewSettings`, {
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
    this.showFilterModal = true;
  }

  /**
   * Apply filter
   */
  onApplyFilter(): void {
    this.showFilterModal = false;
    
    // If live view is enabled, restart with new filter
    if (this.isLiveViewEnabled) {
      this.stopLiveView();
      setTimeout(() => {
        this.startLiveView();
      }, 500);
    }
  }

  /**
   * Close filter modal
   */
  onCloseFilterModal(): void {
    this.showFilterModal = false;
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
