// Timezone Component
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

// Import configurations
import { joinOptions } from './timezone-config';
import { tableColumns } from './timezone-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './timezone-form-config';

// Import types from DataTableComponent
import { 
  DataTableComponent, 
  TableColumn, 
  ToolbarConfig, 
  ToolbarItem,
  GridResponse, 
  JoinOption,
  FormTab,
  ColumnType
} from 'src/app/components/data-table/data-table.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';

@Component({
  selector: 'app-timezone',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule, 
    TablerIconsModule,
    TranslateModule,
    DataTableComponent,
    ModalComponent
  ],
  templateUrl: './timezone.component.html',
  styleUrls: ['./timezone.component.scss']
})
export class TimezoneComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  @ViewChild('timeZonePeriodGrid') timeZonePeriodGridComponent?: DataTableComponent;

  private isReloading: boolean = false;

  // Track selected records
  selectedRecords: any[] = [];

  // TimeZone Period Modal
  showTimeZonePeriodModal = false;
  selectedTimeZoneId: number | null = null;
  timeZonePeriodColumns: TableColumn[] = [];
  timeZonePeriodDataSource?: (params: any) => Observable<GridResponse>;
  timeZonePeriodFormFields: TableColumn[] = [];
  timeZonePeriodFormTabs: FormTab[] = [];
  timeZonePeriodFormLoadUrl?: string;
  timeZonePeriodFormLoadRequest?: (recid: any, parentFormData?: any) => any;
  timeZonePeriodFormDataMapper?: (apiRecord: any) => any;

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
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/TimeZones`, {
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
        console.error('Error loading timezones:', error);
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
          id: 'editPeriod',
          type: 'button' as const,
          text: 'Periyotları Düzenle',
          icon: 'pencil',
          tooltip: 'Periyotları Düzenle',
          onClick: (event: MouseEvent, item: ToolbarItem) => this.onEditPeriods(event, item)
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
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/TimeZones/form`;
    const recid = data.TimeZoneID || data.recid || null;
    const { TimeZoneID, recid: _, ...record } = data;
    
    return this.http.post(url, {
      request: {
        action: 'save',
        recid: recid,
        name: isEdit ? 'EditTimezone' : 'AddTimezone',
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
    // Initialize TimeZone Period columns
    this.timeZonePeriodColumns = [
      { 
        field: 'TimeZonePeriodID', 
        label: 'Period No', 
        text: 'Period No',
        type: 'int' as ColumnType, 
        sortable: true, 
        width: '120px', 
        size: '120px',
        min: 20,
        searchable: 'int',
        resizable: true
      },
      { 
        field: 'DayOfWeek', 
        label: 'Haftanın Günü', 
        text: 'Haftanın Günü',
        type: 'list' as ColumnType, 
        sortable: true, 
        width: '150px', 
        size: '150px',
        min: 20,
        searchable: 'list',
        resizable: true,
        options: [
          { label: 'Pazartesi', value: 1 },
          { label: 'Salı', value: 2 },
          { label: 'Çarşamba', value: 3 },
          { label: 'Perşembe', value: 4 },
          { label: 'Cuma', value: 5 },
          { label: 'Cumartesi', value: 6 },
          { label: 'Pazar', value: 0 }
        ],
        render: (record: any) => {
          const dayMap: { [key: number]: string } = {
            1: 'Pazartesi',
            2: 'Salı',
            3: 'Çarşamba',
            4: 'Perşembe',
            5: 'Cuma',
            6: 'Cumartesi',
            0: 'Pazar'
          };
          return dayMap[record.DayOfWeek] || '';
        }
      },
      { 
        field: 'StartTime', 
        label: 'Başlangıç Saati', 
        text: 'Başlangıç Saati',
        type: 'time' as ColumnType, 
        sortable: true, 
        width: '150px', 
        size: '150px',
        min: 20,
        searchable: 'time',
        resizable: true
      },
      { 
        field: 'EndTime', 
        label: 'Bitiş Saati', 
        text: 'Bitiş Saati',
        type: 'time' as ColumnType, 
        sortable: true, 
        width: '150px', 
        size: '150px',
        min: 20,
        searchable: 'time',
        resizable: true
      }
    ];

    // Initialize TimeZone Period form fields
    this.timeZonePeriodFormFields = [
      { 
        field: 'TimeZonePeriodID', 
        label: 'Period No', 
        text: 'Period No',
        type: 'int' as ColumnType,
        hidden: true,
        disabled: true
      },
      { 
        field: 'DayOfWeek', 
        label: 'Haftanın Günleri', 
        text: 'Haftanın Günleri',
        type: 'list' as ColumnType,
        options: [
          { label: 'Pazartesi', value: 1 },
          { label: 'Salı', value: 2 },
          { label: 'Çarşamba', value: 3 },
          { label: 'Perşembe', value: 4 },
          { label: 'Cuma', value: 5 },
          { label: 'Cumartesi', value: 6 },
          { label: 'Pazar', value: 0 }
        ],
        fullWidth: true
      },
      { 
        field: 'StartTime', 
        label: 'Başlangıç Saati', 
        text: 'Başlangıç Saati',
        type: 'time' as ColumnType,
        fullWidth: true
      },
      { 
        field: 'EndTime', 
        label: 'Bitiş Saati', 
        text: 'Bitiş Saati',
        type: 'time' as ColumnType,
        fullWidth: true
      },
      { 
        field: 'TimeZoneID', 
        label: 'TimeZone ID', 
        text: 'TimeZone ID',
        type: 'int' as ColumnType,
        hidden: true
      }
    ];

    // Initialize form tabs
    this.timeZonePeriodFormTabs = [
      {
        label: 'Genel Bilgiler',
        fields: ['DayOfWeek', 'StartTime', 'EndTime']
      }
    ];

    // Form load URL
    this.timeZonePeriodFormLoadUrl = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/TimeZonePeriods/form`;

    // Form load request
    this.timeZonePeriodFormLoadRequest = (recid: any) => ({
      request: {
        action: 'load',
        recid: recid,
        name: 'EditTimeZonePeriod'
      }
    });

    // Form data mapper
    this.timeZonePeriodFormDataMapper = (apiRecord: any) => {
      return {
        TimeZonePeriodID: apiRecord.TimeZonePeriodID,
        DayOfWeek: apiRecord.DayOfWeek,
        StartTime: apiRecord.StartTime,
        EndTime: apiRecord.EndTime,
        TimeZoneID: apiRecord.TimeZoneID || this.selectedTimeZoneId
      };
    };
  }

  // Event handlers
  onTableRowClick(event: any): void {
    // Handle row click
  }

  onTableRowDblClick(event: any): void {
    // Handle row double click
  }

  onTableRowSelect(event: any): void {
    // Track selected records
    this.selectedRecords = event || [];
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

    // Extract TimeZoneID from selected rows
    const selectedIds: number[] = [];
    const rows = Array.isArray(event) ? event : [event];
    
    rows.forEach((row: any) => {
      const id = row.TimeZoneID || row.recid || row.id;
      if (id !== null && id !== undefined) {
        selectedIds.push(Number(id));
      }
    });

    if (selectedIds.length === 0) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }

    // Call delete API
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/TimeZones/delete`, {
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

  // Edit Periods button handler
  onEditPeriods(event: MouseEvent, item: ToolbarItem): void {
    if (this.selectedRecords.length !== 1) {
      this.toastr.warning('Lütfen 1 adet kayıt seçiniz.', 'Uyarı');
      return;
    }

    const selectedRecord = this.selectedRecords[0];
    const timeZoneId = selectedRecord['TimeZoneID'] || selectedRecord['recid'] || selectedRecord['id'];
    
    if (!timeZoneId) {
      this.toastr.error('Geçersiz kayıt seçildi.', 'Hata');
      return;
    }

    this.selectedTimeZoneId = Number(timeZoneId);
    this.openTimeZonePeriodModal();
  }

  // Open TimeZone Period Modal
  openTimeZonePeriodModal(): void {
    if (!this.selectedTimeZoneId) {
      return;
    }

    // Setup data source
    this.timeZonePeriodDataSource = (params: any) => {
      return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/TimeZonePeriods`, {
        page: params.page || 1,
        limit: params.limit || 100,
        offset: ((params.page || 1) - 1) * (params.limit || 100),
        search: params.search || undefined,
        searchLogic: params.searchLogic || 'AND',
        sort: params.sort,
        TimeZoneID: this.selectedTimeZoneId,
        columns: this.timeZonePeriodColumns
      }).pipe(
        map((response: GridResponse) => ({
          status: 'success' as const,
          total: response.total || (response.records ? response.records.length : 0),
          records: response.records || []
        })),
        catchError(error => {
          console.error('Error loading timezone periods:', error);
          return of({
            status: 'error' as const,
            total: 0,
            records: []
          } as GridResponse);
        })
      );
    };

    this.showTimeZonePeriodModal = true;
  }

  // Close TimeZone Period Modal
  onTimeZonePeriodModalShowChange(show: boolean): void {
    this.showTimeZonePeriodModal = show;
    if (!show) {
      this.selectedTimeZoneId = null;
      this.timeZonePeriodDataSource = undefined;
    }
  }

  onTimeZonePeriodModalOpened(): void {
    // Reload grid when modal opens
    setTimeout(() => {
      if (this.timeZonePeriodGridComponent) {
        this.timeZonePeriodGridComponent.reload();
      }
    }, 100);
  }

  onTimeZonePeriodModalClose(): void {
    this.selectedTimeZoneId = null;
    this.timeZonePeriodDataSource = undefined;
  }

  // Save handler for TimeZone Period
  onTimeZonePeriodSave = (data: any, isEdit: boolean): Observable<any> => {
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/TimeZonePeriods/form`;
    const recid = data.TimeZonePeriodID || data.recid || null;
    const { TimeZonePeriodID, recid: _, ...record } = data;
    
    // Ensure TimeZoneID is set
    if (!record.TimeZoneID && this.selectedTimeZoneId) {
      record.TimeZoneID = this.selectedTimeZoneId;
    }
    
    return this.http.post(url, {
      request: {
        action: 'save',
        recid: recid,
        name: isEdit ? 'EditTimeZonePeriod' : 'AddTimeZonePeriod',
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

  // Form change handler for TimeZone Period
  onTimeZonePeriodFormChange = (formData: any) => {
    // Ensure TimeZoneID is set when adding new period
    if (!formData.TimeZoneID && this.selectedTimeZoneId) {
      formData.TimeZoneID = this.selectedTimeZoneId;
    }
  };

  // Add TimeZone Period
  onTimeZonePeriodAdd(): void {
    if (this.timeZonePeriodGridComponent) {
      this.timeZonePeriodGridComponent.openAddForm();
    }
  }

  // Edit TimeZone Period
  onTimeZonePeriodEdit(event: any): void {
    if (event && event.selectedRecord) {
      if (this.timeZonePeriodGridComponent) {
        this.timeZonePeriodGridComponent.openEditForm(event.selectedRecord);
      }
    }
  }

  // Delete TimeZone Period
  onTimeZonePeriodDelete(event: any): void {
    if (!event || (Array.isArray(event) && event.length === 0)) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }

    const selectedIds: number[] = [];
    const rows = Array.isArray(event) ? event : [event];
    
    rows.forEach((row: any) => {
      const id = row.TimeZonePeriodID || row.recid || row.id;
      if (id !== null && id !== undefined) {
        selectedIds.push(Number(id));
      }
    });

    if (selectedIds.length === 0) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }

    // Call delete API
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/TimeZonePeriods/delete`, {
      request: {
        action: 'delete',
        recid: selectedIds
      }
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.toastr.success(this.translate.instant('common.deleteSuccess'), this.translate.instant('common.success'));
          if (this.timeZonePeriodGridComponent) {
            setTimeout(() => {
              this.timeZonePeriodGridComponent?.reload();
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
}
