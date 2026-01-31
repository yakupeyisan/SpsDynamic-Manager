// TerminalTariffs Component
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
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { FormComponent } from 'src/app/components/form/form.component';
import { FormFieldComponent } from 'src/app/components/form/form-field.component';
import { SelectComponent, SelectOption } from 'src/app/components/select/select.component';
import { InputComponent } from 'src/app/components/input/input.component';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

// Import configurations
import { joinOptions } from './terminal-tariffs-config';
import { tableColumns } from './terminal-tariffs-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './terminal-tariffs-form-config';

// Import types from DataTableComponent
import { 
  DataTableComponent, 
  TableColumn, 
  ToolbarConfig, 
  GridResponse, 
  JoinOption,
  FormTab,
  TableColumnGroup
} from 'src/app/components/data-table/data-table.component';
import { ButtonComponent } from 'src/app/components';

@Component({
  selector: 'app-terminal-tariffs',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule, 
    TablerIconsModule,
    TranslateModule,
    DataTableComponent,
    ModalComponent,
    FormComponent,
    FormFieldComponent,
    SelectComponent,
    InputComponent,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent
  ],
  templateUrl: './terminal-tariffs.component.html',
  styleUrls: ['./terminal-tariffs.component.scss']
})
export class TerminalTariffsComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;

  private isReloading: boolean = false;

  // Modal states
  showBulkDefinitionModal: boolean = false;
  showCopySettingsModal: boolean = false;

  // Bulk Definition Form
  bulkDefinitionForm: FormGroup;
  
  // Copy Settings Form
  copySettingsForm: FormGroup;

  // Dropdown options
  cafeteriaGroups: SelectOption[] = [];
  cafeteriaApplications: SelectOption[] = [];
  dailyLimitOptions: SelectOption[] = [
    { label: 'Limitsiz', value: -1 },
    { label: 'Kapalı', value: 0 },
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '6', value: 6 },
    { label: '7', value: 7 }
  ];
  terminals: SelectOption[] = [];

  // Table configuration
  tableColumns: TableColumn[] = tableColumns;
  columnGroups: TableColumnGroup[] = [
    { span: 4, text: 'Genel', main: true },
    { span: 4, text: 'Öğün 1' },
    { span: 4, text: 'Öğün 2' },
    { span: 4, text: 'Öğün 3' },
    { span: 4, text: 'Öğün 4' }
  ];
  joinOptions: JoinOption[] = joinOptions;
  
  // Form configuration
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = [];
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;
  
  // Data source function for table
  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/TerminalTariffs`, {
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
        console.error('Error loading terminal tariffs:', error);
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
          id: 'bulk-define',
          type: 'button',
          text: 'Toplu tanımla',
          icon: 'plus',
          tooltip: 'Toplu Kafeterya Tanımlama',
          onClick: (event) => this.openBulkDefinitionModal()
        },
        {
          id: 'copy-settings',
          type: 'button',
          text: 'Ayar kopyalama',
          icon: 'copy',
          tooltip: 'Terminal Tarifesi Kopyala',
          onClick: (event) => this.openCopySettingsModal()
        }
      ],
      show: {
        reload: true,
        columns: true,
        search: true,
        add: false,
        edit: true,
        delete: false,
        save: false
      }
    };
  }

  // Save handler
  onSave = (data: any, isEdit: boolean): Observable<any> => {
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/TerminalTariffs/form`;
    const recid = data.TariffID || data.recid || null;
    const { TariffID, recid: _, ...record } = data;
    
    // Multiply pass fee values by 100 before sending to API (API expects values multiplied by 100)
    const passFeeFields = [
      'App1FirstPassFee', 'App1SecondPassFee',
      'App2FirstPassFee', 'App2SecondPassFee',
      'App3FirstPassFee', 'App3SecondPassFee',
      'App4FirstPassFee', 'App4SecondPassFee'
    ];
    
    passFeeFields.forEach(field => {
      if (record[field] != null && record[field] !== '' && record[field] !== undefined) {
        const numValue = typeof record[field] === 'string' ? parseFloat(record[field]) : record[field];
        if (!isNaN(numValue)) {
          record[field] = Math.round(numValue * 100);
        }
      }
    });
    
    return this.http.post(url, {
      request: {
        action: 'save',
        recid: recid,
        name: isEdit ? 'EditTerminalTariff' : 'AddTerminalTariff',
        record: record
      }
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

  // Form change handler
  onFormChange = (formData: any) => {
    // Handle form data changes if needed
  };

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    // Initialize forms
    this.bulkDefinitionForm = this.fb.group({
      CafeteriaGroupID: ['', Validators.required],
      TimeZoneID: ['', Validators.required],
      FirstPassFee: [''],
      SecondPassFee: [''],
      DailyLimitCredit: [''],
      DailyLimitBalance: ['']
    });

    this.copySettingsForm = this.fb.group({
      SourceReaderID: ['', Validators.required],
      TargetReaderID: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load CafeteriaApplications to update column group labels
    this.loadCafeteriaApplications();
    // Load dropdown options
    this.loadCafeteriaGroups();
    this.loadTerminals();
  }

  private loadCafeteriaApplications(): void {
    this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CafeteriaApplications`, {
      limit: -1,
      offset: 0
    }).pipe(
      map((response: GridResponse) => {
        const records = response.records || [];
        this.cafeteriaApplications = records.map((item: any) => ({
          label: item.ApplicationName,
          value: item.CafeteriaApplicationID 
        }));
        // Create a map of application IDs to names
        const applicationMap: { [key: number]: string } = {};
        records.forEach((app: any) => {
          const id = app.CafeteriaApplicationID;
          const name = app.ApplicationName;
          if (id && name) {
            applicationMap[id] = name;
          }
        });

        // Update column groups with application names
        this.columnGroups = [
          { span: 4, text: 'Genel', main: true },
          { span: 4, text: applicationMap[1] || 'Öğün 1' },
          { span: 4, text: applicationMap[2] || 'Öğün 2' },
          { span: 4, text: applicationMap[3] || 'Öğün 3' },
          { span: 4, text: applicationMap[4] || 'Öğün 4' }
        ];

        // Update form tabs with application names
        this.formTabs = [
          { 
            label: 'Genel Bilgiler', 
            fields: ['ProjectID', 'ReaderID', 'CafeteriaGroupID'] 
          },
          { 
            label: applicationMap[1] || 'Uygulama 1', 
            fields: ['App1FirstPassFee', 'App1SecondPassFee', 'App1PassLimitBalance', 'App1PassLimitCredit'] 
          },
          { 
            label: applicationMap[2] || 'Uygulama 2', 
            fields: ['App2FirstPassFee', 'App2SecondPassFee', 'App2PassLimitBalance', 'App2PassLimitCredit'] 
          },
          { 
            label: applicationMap[3] || 'Uygulama 3', 
            fields: ['App3FirstPassFee', 'App3SecondPassFee', 'App3PassLimitBalance', 'App3PassLimitCredit'] 
          },
          { 
            label: applicationMap[4] || 'Uygulama 4', 
            fields: ['App4FirstPassFee', 'App4SecondPassFee', 'App4PassLimitBalance', 'App4PassLimitCredit'] 
          }
        ];

        this.cdr.detectChanges();
        return response;
      }),
      catchError(error => {
        console.error('Error loading cafeteria applications:', error);
        // Keep default column groups and form tabs on error
        this.formTabs = [
          { 
            label: 'Genel Bilgiler', 
            fields: ['ProjectID', 'ReaderID', 'CafeteriaGroupID'] 
          },
          { 
            label: 'Uygulama 1', 
            fields: ['App1FirstPassFee', 'App1SecondPassFee', 'App1PassLimitBalance', 'App1PassLimitCredit'] 
          },
          { 
            label: 'Uygulama 2', 
            fields: ['App2FirstPassFee', 'App2SecondPassFee', 'App2PassLimitBalance', 'App2PassLimitCredit'] 
          },
          { 
            label: 'Uygulama 3', 
            fields: ['App3FirstPassFee', 'App3SecondPassFee', 'App3PassLimitBalance', 'App3PassLimitCredit'] 
          },
          { 
            label: 'Uygulama 4', 
            fields: ['App4FirstPassFee', 'App4SecondPassFee', 'App4PassLimitBalance', 'App4PassLimitCredit'] 
          }
        ];
        return of(null);
      })
    ).subscribe();
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
    if (!this.isReloading && this.dataTableComponent) {
      this.isReloading = true;
      setTimeout(() => {
        this.isReloading = false;
      }, 1000);
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
      const id = row.TariffID || row.recid || row.id;
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
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/TerminalTariffs/delete`, {
      request: {
        action: 'delete',
        recid: selectedIds
      }
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.toastr.success(this.translate.instant('common.deleteSuccess'), this.translate.instant('common.success'));
          if (!this.isReloading && this.dataTableComponent) {
            this.isReloading = true;
            setTimeout(() => {
              if (this.dataTableComponent) {
                this.dataTableComponent.reload();
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

  // Modal handlers
  openBulkDefinitionModal(): void {
    this.bulkDefinitionForm.reset();
    this.showBulkDefinitionModal = true;
  }

  closeBulkDefinitionModal(): void {
    this.showBulkDefinitionModal = false;
    this.bulkDefinitionForm.reset();
  }

  openCopySettingsModal(): void {
    this.copySettingsForm.reset();
    this.showCopySettingsModal = true;
  }

  closeCopySettingsModal(): void {
    this.showCopySettingsModal = false;
    this.copySettingsForm.reset();
  }

  // Load dropdown options
  private loadCafeteriaGroups(): void {
    this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CafeteriaGroups`, {
      limit: -1,
      offset: 0
    }).pipe(
      map((response: GridResponse) => {
        this.cafeteriaGroups = (response.records || []).map((item: any) => ({
          label: item.CafeteriaGroupName || item.Name || '',
          value: item.CafeteriaGroupID || item.Id || item.id
        }));
        this.cdr.detectChanges();
        return response;
      }),
      catchError(error => {
        console.error('Error loading cafeteria groups:', error);
        return of(null);
      })
    ).subscribe();
  }

  private loadTerminals(): void {
    this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals`, {
      limit: -1,
      offset: 0
    }).pipe(
      map((response: GridResponse) => {
        this.terminals = (response.records || []).map((item: any) => ({
          label: item.ReaderName || item.TerminalName || item.Name || '',
          value: item.ReaderID || item.TerminalID || item.Id || item.id
        }));
        this.cdr.detectChanges();
        return response;
      }),
      catchError(error => {
        console.error('Error loading terminals:', error);
        return of(null);
      })
    ).subscribe();
  }

  // Form submit handlers
  onBulkDefinitionSubmit(): void {
    if (this.bulkDefinitionForm.valid) {
      const formData = this.bulkDefinitionForm.value;
      // TODO: Implement bulk definition API call
      this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/TerminalTariffs/bulk`, {
        request: {
          action: 'bulk',
          record: formData
        }
      }).subscribe({
        next: (response: any) => {
          if (response.error === false || response.status === 'success') {
            this.toastr.success('Toplu tanımlama başarılı', 'Başarılı');
            this.closeBulkDefinitionModal();
            if (this.dataTableComponent) {
              this.dataTableComponent.reload();
            }
          } else {
            this.toastr.error(response.message || 'Toplu tanımlama başarısız', 'Hata');
          }
        },
        error: (error) => {
          console.error('Bulk definition error:', error);
          this.toastr.error('Toplu tanımlama başarısız', 'Hata');
        }
      });
    } else {
      this.toastr.warning('Lütfen tüm zorunlu alanları doldurun', 'Uyarı');
    }
  }

  onCopySettingsSubmit(): void {
    if (this.copySettingsForm.valid) {
      const formData = this.copySettingsForm.value;
      // API call to clone terminal tariff
      this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/TerminalTariffs/Clone`, {
        SourceReaderID: formData.SourceReaderID,
        TargetReaderID: formData.TargetReaderID
      }).pipe(
        catchError(error => {
          console.error('Copy settings error:', error);
          const errorMessage = error?.error?.message || error?.message || 'Ayar kopyalama başarısız';
          this.toastr.error(errorMessage, 'Hata');
          return of(null);
        })
      ).subscribe({
        next: (response: any) => {
          if (response && (response.error === false || response.status === 'success')) {
            this.toastr.success('Ayar kopyalama başarılı', 'Başarılı');
            this.closeCopySettingsModal();
            if (this.dataTableComponent) {
              this.dataTableComponent.reload();
            }
          } else if (response) {
            this.toastr.error(response.message || 'Ayar kopyalama başarısız', 'Hata');
          }
        }
      });
    } else {
      this.toastr.warning('Lütfen tüm zorunlu alanları doldurun', 'Uyarı');
    }
  }
}
