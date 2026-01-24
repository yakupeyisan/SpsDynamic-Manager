// Terminals Component
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
import { joinOptions } from './terminals-config';
import { tableColumns } from './terminals-table-columns';
import { formFields, formLoadUrl, formLoadRequest, formDataMapper } from './terminals-form-config';
import { DataTableComponent, TableColumn, ToolbarConfig, ToolbarItem, GridResponse, JoinOption, FormTab, TableRow, ColumnType } from 'src/app/components/data-table/data-table.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';

@Component({
  selector: 'app-terminals',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule, DataTableComponent, ModalComponent],
  templateUrl: './terminals.component.html',
  styleUrls: ['./terminals.component.scss']
})
export class TerminalsComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  @ViewChild('accessPermissionGrid') accessPermissionGridComponent?: DataTableComponent;
  private isReloading: boolean = false;
  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = []; // Will be initialized in ngOnInit from API
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;
  
  // Access Permission View Modal
  showAccessPermissionModal = false;
  accessPermissionReaderId: number | null = null;
  accessPermissionColumns: TableColumn[] = [];
  accessPermissionDataSource?: (params: any) => Observable<GridResponse>;
  
  // Track selected records
  selectedRecords: TableRow[] = [];
  
  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals`, {
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
        console.error('Error loading terminals:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  get tableToolbarConfig(): ToolbarConfig {
    return { 
      items: [
        {
          id: 'getTerminalEmployee',
          type: 'button' as const,
          text: 'Yetkili Kişiler Ve Kartları Göster',
          icon: 'fa fa-eye',
          tooltip: 'Yetkili Kişiler Ve Kartları Göster',
          onClick: (event: MouseEvent, item: ToolbarItem) => this.onShowAuthorizedPersons(event, item)
        }
      ], 
      show: { reload: true, columns: true, search: true, add: true, edit: true, delete: true, save: false } 
    };
  }

  onSave = (data: any, isEdit: boolean): Observable<any> => {
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/form`;
    const recid = data.ReaderID || data.recid || null;
    const { ReaderID, recid: _, ...record } = data;
    return this.http.post(url, {
      request: { action: 'save', recid: recid, name: isEdit ? 'EditTerminal' : 'AddTerminal', record: record }
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

  onFormChange = (formData: any) => {
    if (formData && formData.hasOwnProperty('ReaderTypeSelect')) {
      const readerType = formData['ReaderTypeSelect'];
      
      // Reset all three checkbox fields
      formData['isAccess'] = false;
      formData['isCafeteria'] = false;
      formData['isLocal'] = false;
      
      // Set the selected one to true
      if (readerType === 'isAccess') {
        formData['isAccess'] = true;
      } else if (readerType === 'isCafeteria') {
        formData['isCafeteria'] = true;
      } else if (readerType === 'isLocal') {
        formData['isLocal'] = true;
      }
      
      // Trigger change detection if dataTableComponent is available
      if (this.dataTableComponent) {
        this.cdr.markForCheck();
      }
    }
  };
  constructor(private http: HttpClient, private toastr: ToastrService, public translate: TranslateService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    // Load CafeteriaApplications to get tab names dynamically
    this.loadCafeteriaApplications();
    
    // Initialize Access Permission View columns
    this.accessPermissionColumns = [
      { 
        field: 'CardID', 
        label: 'Kart ID', 
        text: 'Kart ID',
        type: 'int' as ColumnType, 
        sortable: true, 
        width: '80px', 
        size: '80px',
        min: 20,
        searchable: 'int',
        resizable: true
      },
      { 
        field: 'EmployeeName', 
        label: 'Ad', 
        text: 'Ad',
        type: 'text' as ColumnType, 
        sortable: false, 
        width: '120px', 
        size: '120px',
        min: 20,
        searchable: false,
        resizable: true,
        render: (record: any) => record.Employee?.Name || ''
      },
      { 
        field: 'EmployeeSurName', 
        label: 'Soyad', 
        text: 'Soyad',
        type: 'text' as ColumnType, 
        sortable: false, 
        width: '120px', 
        size: '120px',
        min: 20,
        searchable: false,
        resizable: true,
        render: (record: any) => record.Employee?.SurName || ''
      },
      { 
        field: 'IdentificationNumber', 
        label: 'TC Kimlik No', 
        text: 'TC Kimlik No',
        type: 'text' as ColumnType, 
        sortable: false, 
        width: '120px', 
        size: '120px',
        min: 20,
        searchable: false,
        resizable: true,
        render: (record: any) => record.Employee?.IdentificationNumber || ''
      },
      { 
        field: 'DepartmentName', 
        label: 'Departman', 
        text: 'Departman',
        type: 'text' as ColumnType, 
        sortable: false, 
        width: '200px', 
        size: '200px',
        min: 20,
        searchable: false,
        resizable: true,
        render: (record: any) => {
          if (record.Employee?.EmployeeDepartments && record.Employee.EmployeeDepartments.length > 0) {
            return record.Employee.EmployeeDepartments.map((ed: any) => ed.Department?.DepartmentName).filter(Boolean).join(', ') || '';
          }
          return '';
        }
      },
      { 
        field: 'TagCode', 
        label: 'Tag Kodu', 
        text: 'Tag Kodu',
        type: 'text' as ColumnType, 
        sortable: true, 
        width: '100px', 
        size: '100px',
        min: 20,
        searchable: 'text',
        resizable: true
      },
      { 
        field: 'CardCode', 
        label: 'Kart Kodu', 
        text: 'Kart Kodu',
        type: 'text' as ColumnType, 
        sortable: true, 
        width: '100px', 
        size: '100px',
        min: 20,
        searchable: 'text',
        resizable: true
      },
      { 
        field: 'CardUID', 
        label: 'Kart UID', 
        text: 'Kart UID',
        type: 'text' as ColumnType, 
        sortable: true, 
        width: '120px', 
        size: '120px',
        min: 20,
        searchable: 'text',
        resizable: true
      },
      { 
        field: 'CardCodeType', 
        label: 'Kart Yapısı', 
        text: 'Kart Yapısı',
        type: 'text' as ColumnType, 
        sortable: true, 
        width: '120px', 
        size: '120px',
        min: 20,
        searchable: 'text',
        resizable: true
      },
      { 
        field: 'CardType', 
        label: 'Kart Tipi', 
        text: 'Kart Tipi',
        type: 'text' as ColumnType, 
        sortable: false, 
        width: '120px', 
        size: '120px',
        min: 20,
        searchable: false,
        resizable: true,
        render: (record: any) => record.CardType?.CardType || ''
      },
      { 
        field: 'CardStatus', 
        label: 'Kart Statüsü', 
        text: 'Kart Statüsü',
        type: 'text' as ColumnType, 
        sortable: false, 
        width: '120px', 
        size: '120px',
        min: 20,
        searchable: false,
        resizable: true,
        render: (record: any) => record.CardStatus?.Name || ''
      },
      { 
        field: 'CafeteriaGroupName', 
        label: 'Kafeterya Grup', 
        text: 'Kafeterya Grup',
        type: 'text' as ColumnType, 
        sortable: false, 
        width: '150px', 
        size: '150px',
        min: 20,
        searchable: false,
        resizable: true,
        render: (record: any) => record.CafeteriaGroup?.CafeteriaGroupName || ''
      },
      { 
        field: 'FacilityCode', 
        label: 'Tesis Kodu', 
        text: 'Tesis Kodu',
        type: 'text' as ColumnType, 
        sortable: true, 
        width: '100px', 
        size: '100px',
        min: 20,
        searchable: 'text',
        resizable: true
      },
      { 
        field: 'Plate', 
        label: 'Plaka', 
        text: 'Plaka',
        type: 'text' as ColumnType, 
        sortable: true, 
        width: '100px', 
        size: '100px',
        min: 20,
        searchable: 'text',
        resizable: true
      },
      { 
        field: 'CardDesc', 
        label: 'Kart Açıklaması', 
        text: 'Kart Açıklaması',
        type: 'text' as ColumnType, 
        sortable: true, 
        width: '150px', 
        size: '150px',
        min: 20,
        searchable: 'text',
        resizable: true
      },
      { 
        field: 'Status', 
        label: 'Durum', 
        text: 'Durum',
        type: 'checkbox' as ColumnType, 
        sortable: true, 
        width: '60px', 
        size: '60px',
        min: 20,
        searchable: 'checkbox',
        resizable: true
      },
      { 
        field: 'isDefined', 
        label: 'Tanımlı', 
        text: 'Tanımlı',
        type: 'checkbox' as ColumnType, 
        sortable: true, 
        width: '60px', 
        size: '60px',
        min: 20,
        searchable: 'checkbox',
        resizable: true
      },
      { 
        field: 'isVisitor', 
        label: 'Ziyaretçi', 
        text: 'Ziyaretçi',
        type: 'checkbox' as ColumnType, 
        sortable: true, 
        width: '60px', 
        size: '60px',
        min: 20,
        searchable: 'checkbox',
        resizable: true
      },
      { 
        field: 'isFingerPrint', 
        label: 'Parmak İzi', 
        text: 'Parmak İzi',
        type: 'checkbox' as ColumnType, 
        sortable: true, 
        width: '60px', 
        size: '60px',
        min: 20,
        searchable: 'checkbox',
        resizable: true
      },
      { 
        field: 'DefinedTime', 
        label: 'Tanımlama Zamanı', 
        text: 'Tanımlama Zamanı',
        type: 'datetime' as ColumnType, 
        sortable: true, 
        width: '150px', 
        size: '150px',
        min: 20,
        searchable: 'datetime',
        resizable: true
      },
      { 
        field: 'FingerPrintUpdateTime', 
        label: 'Parmak İzi Güncelleme', 
        text: 'Parmak İzi Güncelleme',
        type: 'datetime' as ColumnType, 
        sortable: true, 
        width: '150px', 
        size: '150px',
        min: 20,
        searchable: 'datetime',
        resizable: true
      },
      { 
        field: 'TemporaryDate', 
        label: 'Geçici Tarih', 
        text: 'Geçici Tarih',
        type: 'datetime' as ColumnType, 
        sortable: true, 
        width: '150px', 
        size: '150px',
        min: 20,
        searchable: 'datetime',
        resizable: true
      },
      { 
        field: 'TransferTagCode', 
        label: 'Transfer Tag Kodu', 
        text: 'Transfer Tag Kodu',
        type: 'text' as ColumnType, 
        sortable: true, 
        width: '150px', 
        size: '150px',
        min: 20,
        searchable: 'text',
        resizable: true
      },
      { 
        field: 'BackupCardUID', 
        label: 'Yedek Kart UID', 
        text: 'Yedek Kart UID',
        type: 'text' as ColumnType, 
        sortable: true, 
        width: '120px', 
        size: '120px',
        min: 20,
        searchable: 'text',
        resizable: true
      },
      { 
        field: 'CreatedAt', 
        label: 'Oluşturulma', 
        text: 'Oluşturulma',
        type: 'datetime' as ColumnType, 
        sortable: true, 
        width: '150px', 
        size: '150px',
        min: 20,
        searchable: 'datetime',
        resizable: true
      },
      { 
        field: 'UpdatedAt', 
        label: 'Güncellenme', 
        text: 'Güncellenme',
        type: 'datetime' as ColumnType, 
        sortable: true, 
        width: '150px', 
        size: '150px',
        min: 20,
        searchable: 'datetime',
        resizable: true
      },
      { 
        field: 'DeletedAt', 
        label: 'Silinme', 
        text: 'Silinme',
        type: 'datetime' as ColumnType, 
        sortable: true, 
        width: '150px', 
        size: '150px',
        min: 20,
        searchable: 'datetime',
        resizable: true
      }
    ];

    // Initialize Access Permission View data source
    this.accessPermissionDataSource = (params: any) => {
      if (!this.accessPermissionReaderId) {
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      }
      return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/GetHasAccessByReaderId`, {
        page: params.page || 1,
        limit: params.limit || 100,
        offset: ((params.page || 1) - 1) * (params.limit || 100),
        search: params.search || undefined,
        searchLogic: params.searchLogic || 'AND',
        sort: params.sort,
        ReaderID: this.accessPermissionReaderId,
        columns: this.accessPermissionColumns
      }).pipe(
        map((response: GridResponse) => ({
          status: 'success' as const,
          total: response.total || (response.records ? response.records.length : 0),
          records: response.records || []
        })),
        catchError(error => {
          console.error('Error loading access permission data:', error);
          return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
        })
      );
    };
  }

  private loadCafeteriaApplications(): void {
    this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CafeteriaApplications`, {
      limit: -1,
      offset: 0
    }).pipe(
      map((response: GridResponse) => {
        const records = response.records || [];
        
        // Create a map of application IDs to names
        const applicationMap: { [key: number]: string } = {};
        records.forEach((app: any) => {
          const id = app.CafeteriaApplicationID;
          const name = app.ApplicationName;
          if (id && name) {
            applicationMap[id] = name;
          }
        });

        // Update form tabs with application names
        this.formTabs = [
          { 
            label: 'Genel', 
            fields: [
              'ReaderName',          // Okuyucu Adı
              'ReaderType',          // Terminal Tipi
              'inOUT',               // Okuyucu Yönü
              'SerialNumber',        // Seri No
              'Password',            // Şifre
              'CardTypeID',          // CardTypeID
              'WiegandType',         // Wiegand Tipi
              'ReaderTypeSelect',    // Okuyucu Tipi
              'Status',              // Durum
              'isLive',              // Canlı İzlenebilir mi?
              'isPdks',              // Puantaj Kapısı mı?
              'isCafeteriaDailyLimit', // Kafeterya Günlük Limit
              'isAntiPassBack',      // AntiPassBack
              'isPoll',              // Yoklama Kapısı mı?
              'CafeteriaAccountId',   // Kafeterya Hesabı
            ]
          },
          { 
            label: 'Bağlantı Ayarları', 
            fields: [
              'IpAddress',           // Ip Adresi
              'DevicePort',          // Port
              'ServerIPAddress',     // Server IP Address
              'ServerPort',          // Server Port
              'ConnectionType'       // Bağlantı Tipi
            ]
          },
          { 
            label: 'Diğer', 
            fields: [
              'ReaderPort',          // Okuyucu Portu
              'NodeId',              // Node No
              'RelayIdGranted',      // Onaylandığında Tetikle
              'RelayIdDenied',       // Onaylanmadığında Tetikle
              'RelayHoldTime',       // Role Süresi
              'LocationType',        // Kapı Tipi
              'SntpServer',          // Sntp Server
              'ServerIPAddressFirmwareUpdate' // Firmware Server
            ]
          },
          { 
            label: applicationMap[1] || 'OGLEN YEMEK', 
            fields: ['App1Start', 'App1End', 'App1UseCredit', 'App1UseBalance']
          },
          { 
            label: applicationMap[2] || 'KAHVALTI', 
            fields: ['App2Start', 'App2End', 'App2UseCredit', 'App2UseBalance']
          },
          { 
            label: applicationMap[3] || 'BOŞ 2', 
            fields: ['App3Start', 'App3End', 'App3UseCredit', 'App3UseBalance']
          },
          { 
            label: applicationMap[4] || 'BOŞ 3', 
            fields: ['App4Start', 'App4End', 'App4UseCredit', 'App4UseBalance']
          }
        ];

        this.cdr.markForCheck();
        return response;
      }),
      catchError(error => {
        console.error('Error loading cafeteria applications:', error);
        // Keep default form tabs on error
        this.formTabs = [
          { 
            label: 'Genel', 
            fields: [
              'ReaderName', 'ReaderType', 'inOUT', 'SerialNumber', 'Password', 'CardTypeID', 
              'WiegandType', 'ReaderTypeSelect', 'Status', 'isLive', 'isPdks', 
              'isCafeteriaDailyLimit', 'isAntiPassBack', 'isPoll', 'CafeteriaAccountId'
            ]
          },
          { 
            label: 'Bağlantı Ayarları', 
            fields: ['IpAddress', 'DevicePort', 'ServerIPAddress', 'ServerPort', 'ConnectionType']
          },
          { 
            label: 'Diğer', 
            fields: ['ReaderPort', 'NodeId', 'RelayIdGranted', 'RelayIdDenied', 'RelayHoldTime', 'LocationType', 'SntpServer', 'ServerIPAddressFirmwareUpdate']
          },
          { 
            label: 'OGLEN YEMEK', 
            fields: ['App1Start', 'App1End', 'App1UseCredit', 'App1UseBalance']
          },
          { 
            label: 'KAHVALTI', 
            fields: ['App2Start', 'App2End', 'App2UseCredit', 'App2UseBalance']
          },
          { 
            label: 'BOŞ 2', 
            fields: ['App3Start', 'App3End', 'App3UseCredit', 'App3UseBalance']
          },
          { 
            label: 'BOŞ 3', 
            fields: ['App4Start', 'App4End', 'App4UseCredit', 'App4UseBalance']
          }
        ];
        this.cdr.markForCheck();
        return of(null);
      })
    ).subscribe();
  }

  onTableRowClick(event: any): void {}
  onTableRowDblClick(event: any): void {}
  onTableRowSelect(event: TableRow[]): void {
    this.selectedRecords = event || [];
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
      const id = row.ReaderID || row.recid || row.id;
      if (id !== null && id !== undefined) { selectedIds.push(Number(id)); }
    });
    if (selectedIds.length === 0) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/delete`, { request: { action: 'delete', recid: selectedIds } }).subscribe({
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

  onShowAuthorizedPersons(event: MouseEvent, item: ToolbarItem): void {
    if (this.selectedRecords.length !== 1) {
      this.toastr.warning('Lütfen 1 adet kayıt seçiniz.', 'Uyarı');
      return;
    }
    const selectedRecord = this.selectedRecords[0];
    const readerId = selectedRecord['ReaderID'] || selectedRecord['recid'] || selectedRecord['id'];
    if (!readerId) {
      this.toastr.error('Terminal ID bulunamadı.', 'Hata');
      return;
    }
    this.accessPermissionReaderId = Number(readerId);
    this.showAccessPermissionModal = true;
  }

  onAccessPermissionModalShowChange(show: boolean): void {
    this.showAccessPermissionModal = show;
    // Reload grid when modal is opened and ReaderID is set
    if (show && this.accessPermissionReaderId) {
      // Use setTimeout to ensure modal is fully rendered before reload
      setTimeout(() => {
        if (this.accessPermissionGridComponent) {
          this.accessPermissionGridComponent.reload();
        }
      }, 200);
    }
  }

  onAccessPermissionModalOpened(): void {
    // Reload grid after modal is opened and ReaderID is set
    if (this.accessPermissionReaderId && this.accessPermissionGridComponent) {
      // Use setTimeout to ensure modal is fully rendered before reload
      setTimeout(() => {
        if (this.accessPermissionGridComponent) {
          this.accessPermissionGridComponent.reload();
        }
      }, 200);
    }
  }

  onAccessPermissionModalClose(): void {
    this.showAccessPermissionModal = false;
    this.accessPermissionReaderId = null;
  }
}
