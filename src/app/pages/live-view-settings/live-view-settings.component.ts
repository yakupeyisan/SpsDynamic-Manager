// LiveViewSettings Component
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { joinOptions } from './live-view-settings-config';
import { tableColumns } from './live-view-settings-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './live-view-settings-form-config';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, JoinOption, FormTab, ColumnType } from 'src/app/components/data-table/data-table.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';

@Component({
  selector: 'app-live-view-settings',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule, DataTableComponent, ModalComponent],
  templateUrl: './live-view-settings.component.html',
  styleUrls: ['./live-view-settings.component.scss']
})
export class LiveViewSettingsComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  @ViewChild('selectedTerminalsTable') selectedTerminalsTable?: DataTableComponent;
  @ViewChild('unselectedTerminalsTable') unselectedTerminalsTable?: DataTableComponent;
  private isReloading: boolean = false;
  selectedLiveViewSetting: any = null;
  showTerminalSettingsModal: boolean = false;
  liveViewSettingIdForTerminals: number | null = null;
  gridHeight: string = '500px';
  selectedUnselectedTerminals: any[] = [];
  selectedSelectedTerminals: any[] = [];
  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;
  
  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/LiveViewSettings`, {
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
        console.error('Error loading live view settings:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  get tableToolbarConfig(): ToolbarConfig {
    return { 
      items: [
        {
          id: 'settings',
          type: 'menu',
          text: 'Ayarlar',
          icon: 'settings',
          tooltip: 'Ayarlar',
          items: [
            {
              id: 'terminal-settings',
              text: 'Terminal Ayarları',
              onClick: (event) => this.openTerminalSettingsModal()
            }
          ]
        }
      ], 
      show: { reload: true, columns: true, search: true, add: true, edit: true, delete: true, save: false } 
    };
  }

  onSave = (data: any, isEdit: boolean): Observable<any> => {
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/LiveViewSettings/form`;
    const recid = data.Id || data.recid || null;
    const { Id, recid: _, ...record } = data;
    return this.http.post(url, {
      request: { action: 'save', recid: recid, name: isEdit ? 'EditLiveViewSetting' : 'AddLiveViewSetting', record: record }
    }).pipe(
      map((response: any) => {
        if (response.error === false || response.status === 'success') {
          this.toastr.success(this.translate.instant('common.saveSuccess'), this.translate.instant('common.success'));
          return { error: false, record: response.record || response };
        } else {
          this.toastr.error(response.message || this.translate.instant('common.saveError'), this.translate.instant('common.error'));
          return { error: true, message: response.message || this.translate.instant('common.saveError') };
        }
      }),
      catchError(error => {
        this.toastr.error(this.translate.instant('common.saveError'), this.translate.instant('common.error'));
        return of({ error: true, message: error.message || this.translate.instant('common.saveError') });
      })
    );
  };

  onFormChange = (formData: any) => {};
  constructor(private http: HttpClient, private toastr: ToastrService, public translate: TranslateService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {}
  onTableRowClick(event: any): void {
    // Store selected live view setting
    if (event && event.record) {
      this.selectedLiveViewSetting = event.record;
    }
  }
  onTableRowDblClick(event: any): void {
    // Store selected live view setting
    if (event && event.record) {
      this.selectedLiveViewSetting = event.record;
    }
  }
  onTableRowSelect(event: any): void {
    // Store selected live view setting
    if (event && event.selectedRecord) {
      this.selectedLiveViewSetting = event.selectedRecord;
    } else if (this.dataTableComponent) {
      const selectedRows = this.dataTableComponent.selectedRows;
      if (selectedRows.size > 0) {
        const selectedId = Array.from(selectedRows)[0];
        const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
        const selectedRecord = dataSource.find((row: any) => {
          const id = row['recid'] ?? row['Id'] ?? row['id'];
          return id === selectedId;
        });
        if (selectedRecord) {
          this.selectedLiveViewSetting = selectedRecord;
        }
      }
    }
  }
  onTableRefresh(): void {
    if (!this.isReloading && this.dataTableComponent) {
      this.isReloading = true;
      setTimeout(() => { this.isReloading = false; }, 1000);
    }
  }

  onTableDelete(event: any): void {
    if (!event || (Array.isArray(event) && event.length === 0)) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }
    const selectedIds: number[] = [];
    const rows = Array.isArray(event) ? event : [event];
    rows.forEach((row: any) => {
      const id = row.Id || row.recid || row.id;
      if (id !== null && id !== undefined) { selectedIds.push(Number(id)); }
    });
    if (selectedIds.length === 0) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }
    const msg = selectedIds.length === 1
      ? 'Seçili kayıt silinecek. Silmek için onaylıyor musunuz?'
      : `${selectedIds.length} kayıt silinecek. Silmek için onaylıyor musunuz?`;
    if (!window.confirm(msg)) return;

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/LiveViewSettings/delete`, { request: { action: 'delete', recid: selectedIds } }).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.toastr.success(this.translate.instant('common.deleteSuccess'), this.translate.instant('common.success'));
          if (!this.isReloading && this.dataTableComponent) {
            this.isReloading = true;
            setTimeout(() => {
              if (this.dataTableComponent) {
                this.dataTableComponent.reload();
                setTimeout(() => { this.isReloading = false; }, 500);
              } else { this.isReloading = false; }
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

  onTableAdd(): void { if (this.dataTableComponent) { this.dataTableComponent.openAddForm(); } }
  onTableEdit(event: any): void { if (event && event.selectedRecord) { if (this.dataTableComponent) { this.dataTableComponent.openEditForm(event.selectedRecord); } } }
  onAdvancedFilterChange(event: any): void {}

  // Terminal Settings Modal
  openTerminalSettingsModal(): void {
    // Get selected live view setting
    if (!this.selectedLiveViewSetting) {
      this.toastr.warning('Lütfen bir canlı izleme ayarı seçin', 'Uyarı');
      return;
    }

    const liveViewSettingId = this.selectedLiveViewSetting.Id || this.selectedLiveViewSetting.recid;
    if (!liveViewSettingId) {
      this.toastr.warning('Geçersiz canlı izleme ayarı seçimi', 'Uyarı');
      return;
    }

    this.liveViewSettingIdForTerminals = liveViewSettingId;
    this.showTerminalSettingsModal = true;
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

  closeTerminalSettingsModal(): void {
    this.showTerminalSettingsModal = false;
    this.liveViewSettingIdForTerminals = null;
    this.selectedUnselectedTerminals = [];
    this.selectedSelectedTerminals = [];
  }

  // Data source for selected terminals
  selectedTerminalsDataSource = (params: any) => {
    if (!this.liveViewSettingIdForTerminals) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/GetSelectedByLiveViewSettingId`, {
      LiveViewSettingId: this.liveViewSettingIdForTerminals,
      limit: params.limit || 100,
      offset: params.offset || 0
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
    if (!this.liveViewSettingIdForTerminals) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/GetUnSelectedByLiveViewSettingId`, {
      LiveViewSettingId: this.liveViewSettingIdForTerminals,
      limit: params.limit || 100,
      offset: params.offset || 0
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
    if (!this.unselectedTerminalsTable || !this.liveViewSettingIdForTerminals) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedUnselectedTerminals || this.selectedUnselectedTerminals.length === 0) {
      this.toastr.warning('Lütfen aktarılacak terminal seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedUnselectedTerminals.map((row: any) => {
      const id = row.ReaderID || row.TerminalID || row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli terminal seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/AppendLiveViewSettingId`, {
      Selecteds: selectedIds,
      LiveViewSettingId: this.liveViewSettingIdForTerminals
    }).subscribe({
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
    if (!this.selectedTerminalsTable || !this.liveViewSettingIdForTerminals) {
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

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/RemoveListLiveViewSettingId`, {
      Selecteds: selectedIds,
      LiveViewSettingId: this.liveViewSettingIdForTerminals
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

  // Table columns for terminals
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

  // Toolbar config for terminal tables
  get terminalsTableToolbarConfig(): ToolbarConfig {
    return {
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
  }
}
