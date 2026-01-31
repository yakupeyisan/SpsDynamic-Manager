// AccessGroup Component
import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalComponent } from 'src/app/components/modal/modal.component';

// Import configurations
import { joinOptions } from './access-group-config';
import { tableColumns } from './access-group-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './access-group-form-config';

// Import types from DataTableComponent
import { 
  DataTableComponent, 
  TableColumn, 
  ToolbarConfig, 
  GridResponse, 
  JoinOption,
  FormTab,
  ColumnType
} from 'src/app/components/data-table/data-table.component';

@Component({
  selector: 'app-access-group',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule, 
    FormsModule,
    TablerIconsModule,
    TranslateModule,
    DataTableComponent,
    ModalComponent
  ],
  templateUrl: './access-group.component.html',
  styleUrls: ['./access-group.component.scss']
})
export class AccessGroupComponent implements OnInit, AfterViewInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  @ViewChild('selectedTerminalsTable') selectedTerminalsTable?: DataTableComponent;
  @ViewChild('unselectedTerminalsTable') unselectedTerminalsTable?: DataTableComponent;
  @ViewChild('timeZoneCell') timeZoneCellRef?: TemplateRef<any>;

  private isReloading: boolean = false;
  
  // Doors (Terminals) Edit Modal state
  showDoorsModal: boolean = false;
  accessGroupIdForDoors: number | null = null;
  gridHeight: string = '500px';
  selectedUnselectedTerminals: any[] = [];
  selectedSelectedTerminals: any[] = [];
  
  // Time zone options for selected terminals (from POST /api/TimeZones)
  timeZoneOptions: { label: string; value: number }[] = [];
  timeZoneOptionsLoading: boolean = false;
  /** Varsayılan zaman dilimi adı (Kapı eklenirken atanacak). Sistemde ID 1 veya 2 olabilir. */
  readonly defaultTimeZoneName = 'Her Zaman';
  
  // Selected terminals table includes TimeZone column; unselected uses base columns only
  selectedTerminalsTableColumns: TableColumn[] = [];
  
  // Terminal table columns (base; used for unselected panel)
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
  
  // Toolbar config for terminals table
  claimsTableToolbarConfig: ToolbarConfig = {
    items: [],
    show: {
      reload: true,
      columns: false,
      search: true,
      add: false,
      edit: false,
      delete: false,
      save: false
    }
  };

  // Table configuration
  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;
  
  // Form configuration
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;
  
  // Data source function for table
  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/AccessGroups`, {
      page: params.page || 1,
      limit: params.limit || 10,
      offset: ((params.page || 1) - 1) * (params.limit || 10),
      search: params.search || undefined,
      searchLogic: params.searchLogic || 'AND',
      sort: params.sort,
      join: params.join,
      showDeleted: params.showDeleted,
      columns: this.tableColumns
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading access groups:', error);
        return of({
          status: 'error' as const,
          total: 0,
          records: []
        } as GridResponse);
      })
    );
  };

  // Toolbar configuration
  get tableToolbarConfig(): ToolbarConfig {
    return {
      items: [
        {
          type: 'break' as const,
          id: 'break-edit-doors'
        },
        {
          type: 'button' as const,
          id: 'editdoors',
          text: 'Kapıları Düzenle',
          icon: 'fa fa-bookmark',
          onClick: (event: MouseEvent) => this.onEditDoors(event)
        }
      ],
      show: {
        reload: true,
        columns: true,
        search: true,
        add: true,
        edit: true,
        delete: true,
        save: false
      }
    };
  }

  // Save handler
  onSave = (data: any, isEdit: boolean): Observable<any> => {
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/AccessGroups/form`;
    const recid = data.AccessGroupID || data.Id || data.recid || null;
    const { AccessGroupID, Id, recid: _, ...record } = data;
    
    return this.http.post(url, {
      request: {
        action: 'save',
        recid: recid,
        name: isEdit ? 'EditAccessGroup' : 'AddAccessGroup',
        record: record
      }
    }).pipe(
      map((response: any) => {
        // Check if save was successful
        // API returns { error: false, record: {...} } for success or { error: true, message: '...' } for error
        if (response.error === false || response.status === 'success') {
          this.toastr.success(this.translate.instant('common.saveSuccess'), this.translate.instant('common.success'));
          // Return success response - DataTableComponent will handle closing form and reloading grid
          return { error: false, record: response.record || response };
        } else {
          // Error response
          this.toastr.error(response.message || this.translate.instant('common.saveError'), this.translate.instant('common.error'));
          // Return error response - DataTableComponent will keep form open
          return { error: true, message: response.message || this.translate.instant('common.saveError') };
        }
      }),
      catchError(error => {
        this.toastr.error(this.translate.instant('common.saveError'), this.translate.instant('common.error'));
        // Return error response - DataTableComponent will keep form open
        return of({ error: true, message: error.message || this.translate.instant('common.saveError') });
      })
    );
  };

  // Form change handler
  onFormChange = (formData: any) => {
    // Handle form data changes if needed
  };

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    this.buildSelectedTerminalsColumns();
  }

  private buildSelectedTerminalsColumns(): void {
    if (!this.timeZoneCellRef) return;
    const timeZoneCol: TableColumn = {
      field: 'TimeZoneID',
      label: 'Zaman dilimi',
      text: 'Zaman dilimi',
      type: 'text' as ColumnType,
      sortable: false,
      width: '220px',
      size: '220px',
      searchable: false,
      resizable: true,
      template: this.timeZoneCellRef
    };
    this.selectedTerminalsTableColumns = [...this.terminalsTableColumns, timeZoneCol];
    this.cdr.detectChanges();
  }

  loadTimeZoneOptions(): void {
    this.timeZoneOptionsLoading = true;
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    this.http.post<{ records?: any[]; total?: number }>(`${apiUrl}/api/TimeZones`, {
      page: 1,
      limit: 2000,
      offset: 0,
      columns: [{ field: 'TimeZoneID' }, { field: 'TimeZoneName' }]
    }).pipe(
      catchError(() => of({ records: [] }))
    ).subscribe({
      next: (res) => {
        const records = res.records || [];
        this.timeZoneOptions = records.map((r: any) => ({
          label: r.TimeZoneName ?? r.Name ?? String(r.TimeZoneID ?? r.Id ?? ''),
          value: r.TimeZoneID ?? r.Id ?? null
        })).filter((o: any) => o.value != null);
        this.timeZoneOptionsLoading = false;
        this.cdr.detectChanges();
        // Seçenekler yüklendikten sonra grid'i yenile; select'ler doğru değeri göstersin
        setTimeout(() => {
          if (this.selectedTerminalsTable) this.selectedTerminalsTable.reload();
        }, 0);
      },
      error: () => {
        this.timeZoneOptionsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onTimeZoneChange(row: any, value: string): void {
    if (!this.accessGroupIdForDoors) return;
    const readerId = row.ReaderID ?? row.TerminalID ?? row.Id ?? row.recid ?? row.id;
    if (readerId == null) return;
    const timeZoneId = value === '' || value === 'null' ? null : Number(value);
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    this.http.post<{ status?: string; error?: boolean; message?: string }>(`${apiUrl}/api/Terminals/UpdateTimeZone`, {
      AccessGroupID: this.accessGroupIdForDoors,
      ReaderID: Number(readerId),
      TimeZoneID: timeZoneId
    }).subscribe({
      next: (res) => {
        if (res.status === 'success' || res.error === false) {
          this.toastr.success('Zaman dilimi güncellendi', 'Başarılı');
          if (this.selectedTerminalsTable) this.selectedTerminalsTable.reload();
        } else {
          this.toastr.error(res.message || 'Zaman dilimi güncellenirken hata oluştu', 'Hata');
        }
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Zaman dilimi güncellenirken hata oluştu';
        this.toastr.error(msg, 'Hata');
      }
    });
  }

  /** "Her Zaman" zaman diliminin ID'sini döndürür (varsayılan atama). Bulunamazsa ilk seçeneği kullanır. */
  getDefaultTimeZoneId(): number | null {
    if (this.timeZoneOptions.length === 0) return null;
    const herZaman = this.timeZoneOptions.find(
      (o) => (o.label || '').trim().toLowerCase() === this.defaultTimeZoneName.trim().toLowerCase()
    );
    return herZaman != null ? herZaman.value : this.timeZoneOptions[0].value;
  }

  /** Returns TimeZoneID from row as string for select [value] binding (empty = 'Seçiniz'). */
  getTimeZoneIdForRow(row: any): string {
    const agId = this.accessGroupIdForDoors;
    const arr = row.AccessGroupReaders;
    if (agId != null && Array.isArray(arr)) {
      const match = arr.find(
        (r: any) =>
          Number(r.AccessGroupID ?? r.AccessGroupId ?? r.accessGroupID) === Number(agId)
      );
      const v =
        match?.TimeZoneID ??
        match?.timezoneId ??
        match?.TimeZoneId ??
        match?.TimeZone?.TimeZoneID ??
        match?.TimeZone?.Id ??
        null;
      if (v != null) return String(Number(v));
    }
    const v =
      row.TimeZoneID ??
      row.timezoneId ??
      row.TimeZoneId ??
      row.TimeZone?.TimeZoneID ??
      row.TimeZone?.Id ??
      row.TimeZone?.timezoneId ??
      null;
    return v != null ? String(Number(v)) : '';
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
    // refresh event is emitted by reload(), so we don't need to call reload() again
    // This prevents infinite loop: reload() -> refresh.emit() -> onTableRefresh() -> reload() -> ...
    // Just update the flag to prevent multiple simultaneous reloads
    if (!this.isReloading && this.dataTableComponent) {
      this.isReloading = true;
      setTimeout(() => {
        this.isReloading = false;
      }, 1000);
    }
  }

  onTableDelete(event: any): void {
    // event is an array of selected rows
    if (!event || (Array.isArray(event) && event.length === 0)) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }

    // Extract AccessGroupID from selected rows
    const selectedIds: number[] = [];
    const rows = Array.isArray(event) ? event : [event];
    
    rows.forEach((row: any) => {
      const id = row.AccessGroupID || row.Id || row.recid || row.id;
      if (id !== null && id !== undefined) {
        selectedIds.push(Number(id));
      }
    });

    if (selectedIds.length === 0) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }

    const msg = selectedIds.length === 1
      ? 'Seçili kayıt silinecek. Silmek için onaylıyor musunuz?'
      : `${selectedIds.length} kayıt silinecek. Silmek için onaylıyor musunuz?`;
    if (!window.confirm(msg)) return;

    // Call delete API
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/AccessGroups/delete`, {
      request: {
        action: 'delete',
        recid: selectedIds
      }
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.toastr.success(this.translate.instant('common.deleteSuccess'), this.translate.instant('common.success'));
          // Reload table after a short delay to prevent multiple rapid calls
          // Use flag to prevent multiple simultaneous reloads
          if (!this.isReloading && this.dataTableComponent) {
            this.isReloading = true;
            // Use setTimeout to break the potential event loop
            setTimeout(() => {
              if (this.dataTableComponent) {
                this.dataTableComponent.reload();
                // Reset flag after reload completes
                setTimeout(() => {
                  this.isReloading = false;
                }, 500);
              } else {
                this.isReloading = false;
              }
            }, 100);
          }
        } else {
          this.toastr.error(response.message || this.translate.instant('common.deleteError'), this.translate.instant('common.error'));
        }
      },
      error: (error) => {
        console.error('Delete error:', error);
        const errorMessage = error.error?.message || error.message || this.translate.instant('common.deleteError');
        this.toastr.error(errorMessage, this.translate.instant('common.error'));
      }
    });
  }

  onTableAdd(): void {
    if (this.dataTableComponent) {
      this.dataTableComponent.openAddForm();
    }
  }

  onTableEdit(event: any): void {
    if (event && event.selectedRecord) {
      if (this.dataTableComponent) {
        this.dataTableComponent.openEditForm(event.selectedRecord);
      }
    }
  }

  onAdvancedFilterChange(event: any): void {
    // Handle advanced filter change
  }

  // Edit Doors (Terminals) handler
  onEditDoors(event: MouseEvent): void {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }
    
    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen bir yetki grubu seçiniz.');
      return;
    }
    
    // Get selected access group ID
    const selectedIds = Array.from(selectedRows);
    // Use internalData if available (from dataSource), otherwise use filteredData or data
    let dataSource: any[] = [];
    if (this.dataTableComponent.internalData && this.dataTableComponent.internalData.length > 0) {
      dataSource = this.dataTableComponent.internalData;
    } else if (this.dataTableComponent.filteredData && this.dataTableComponent.filteredData.length > 0) {
      dataSource = this.dataTableComponent.filteredData;
    } else if (this.dataTableComponent.data && this.dataTableComponent.data.length > 0) {
      dataSource = this.dataTableComponent.data;
    }
    
    if (!dataSource || dataSource.length === 0) {
      this.toastr.warning('Veri bulunamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.');
      return;
    }
    
    const selectedRow = dataSource.find((row: any) => {
      const rowId = row['recid'] ?? row['AccessGroupID'] ?? row['Id'] ?? row['id'];
      return selectedIds.includes(rowId);
    });
    
    if (!selectedRow) {
      this.toastr.warning('Seçili yetki grubu bulunamadı.');
      return;
    }
    
    const accessGroupId = selectedRow['AccessGroupID'] ?? selectedRow['Id'] ?? selectedRow['recid'] ?? selectedRow['id'];
    if (!accessGroupId) {
      this.toastr.warning('Geçersiz yetki grubu ID.');
      return;
    }
    
    this.accessGroupIdForDoors = Number(accessGroupId);
    this.showDoorsModal = true;
    this.loadTimeZoneOptions();
    
    // Reload tables after a short delay to ensure modal is rendered
    setTimeout(() => {
      if (this.selectedTerminalsTable) {
        this.selectedTerminalsTable.reload();
      }
      if (this.unselectedTerminalsTable) {
        this.unselectedTerminalsTable.reload();
      }
    }, 100);
  }
  
  closeDoorsModal(): void {
    this.showDoorsModal = false;
    this.accessGroupIdForDoors = null;
    this.selectedUnselectedTerminals = [];
    this.selectedSelectedTerminals = [];
  }
  
  onDoorsModalResize(event: { width: number; height: number }): void {
    const newHeight = event.height - 50;
    this.gridHeight = (newHeight < 600 ? 600 : newHeight) + 'px';
  }
  
  // Data source for selected terminals
  selectedTerminalsDataSource = (params: any) => {
    if (!this.accessGroupIdForDoors) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/GetSelectedByAccessGroupID`, {
      limit: params.limit || 100,
      offset: params.offset || 0,
      AccessGroupID: this.accessGroupIdForDoors
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading selected terminals:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };
  
  // Data source for unselected terminals
  unselectedTerminalsDataSource = (params: any) => {
    if (!this.accessGroupIdForDoors) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/GetUnSelectedByAccessGroupID`, {
      limit: params.limit || 100,
      offset: params.offset || 0,
      AccessGroupID: this.accessGroupIdForDoors
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading unselected terminals:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };
  
  // Transfer selected terminals from unselected to selected
  transferTerminalsToSelected(): void {
    if (!this.unselectedTerminalsTable || !this.accessGroupIdForDoors) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedUnselectedTerminals || this.selectedUnselectedTerminals.length === 0) {
      this.toastr.warning('Lütfen aktarılacak terminal seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds: number[] = this.selectedUnselectedTerminals.map((row: any) => {
      const id = row.ReaderID || row.TerminalID || row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id): id is number => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli terminal seçilmedi', 'Uyarı');
      return;
    }

    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    
    this.http.post(`${apiUrl}/api/Terminals/AppendAccessGroupID`, {
      Selecteds: selectedIds,
      AccessGroupID: this.accessGroupIdForDoors
    }).pipe(
      switchMap((response: any) => {
        if (response.status === 'success' || response.error === false) {
          // Varsayılan: "Her Zaman" zaman diliminin ID'si (sistemde 1 veya 2 olabilir)
          const defaultTimeZoneId = this.getDefaultTimeZoneId();
          
          // If there's a default timezone, set it for all transferred terminals
          if (defaultTimeZoneId != null) {
            const updateTimeZoneCalls = selectedIds.map((readerId: number) => 
              this.http.post<{ status?: string; error?: boolean; message?: string }>(`${apiUrl}/api/Terminals/UpdateTimeZone`, {
                AccessGroupID: this.accessGroupIdForDoors,
                ReaderID: Number(readerId),
                TimeZoneID: defaultTimeZoneId
              }).pipe(
                catchError((err) => {
                  console.error(`Error setting timezone for terminal ${readerId}:`, err);
                  return of({ error: true, message: err.message });
                })
              )
            );
            
            // Execute all timezone updates in parallel
            return forkJoin(updateTimeZoneCalls).pipe(
              map(() => response) // Return original response
            );
          }
          
          return of(response);
        } else {
          return of(response);
        }
      })
    ).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Terminaller başarıyla eklendi', 'Başarılı');
          // Clear selections
          this.selectedUnselectedTerminals = [];
          // Reload both tables
          if (this.selectedTerminalsTable) {
            this.selectedTerminalsTable.reload();
          }
          if (this.unselectedTerminalsTable) {
            this.unselectedTerminalsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Terminaller eklenirken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error adding terminals:', error);
        const errorMessage = error.error?.message || error.message || 'Terminaller eklenirken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }
  
  // Transfer selected terminals from selected to unselected
  transferTerminalsToUnselected(): void {
    if (!this.selectedTerminalsTable || !this.accessGroupIdForDoors) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedSelectedTerminals || this.selectedSelectedTerminals.length === 0) {
      this.toastr.warning('Lütfen kaldırılacak terminal seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedSelectedTerminals.map((row: any) => {
      const id = row.ReaderID || row.TerminalID || row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli terminal seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/RemoveListAccessGroupID`, {
      Selecteds: selectedIds,
      AccessGroupID: this.accessGroupIdForDoors
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Terminaller başarıyla kaldırıldı', 'Başarılı');
          // Clear selections
          this.selectedSelectedTerminals = [];
          // Reload both tables
          if (this.selectedTerminalsTable) {
            this.selectedTerminalsTable.reload();
          }
          if (this.unselectedTerminalsTable) {
            this.unselectedTerminalsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Terminaller kaldırılırken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error removing terminals:', error);
        const errorMessage = error.error?.message || error.message || 'Terminaller kaldırılırken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }
}

