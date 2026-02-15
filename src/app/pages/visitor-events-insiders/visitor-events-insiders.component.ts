// VisitorEvents-Insiders Component (İçerideki Ziyaretçiler)
import { Component, ChangeDetectorRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, Observable, Subject, of } from 'rxjs';
import { catchError, debounceTime, map, switchMap, startWith } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';

import { environment } from 'src/environments/environment';
import { MaterialModule } from 'src/app/material.module';
import { DataTableComponent, GridResponse, TableColumn, TableRow, ToolbarConfig } from 'src/app/components/data-table/data-table.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { InputComponent } from 'src/app/components/input/input.component';
import { SelectComponent, SelectOption } from 'src/app/components/select/select.component';

import { tableColumns as insidersColumns } from './visitor-events-insiders-table-columns';

type AnyRecord = Record<string, any>;

@Component({
  selector: 'app-visitor-events-insiders',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    TablerIconsModule,
    TranslateModule,
    DataTableComponent,
    ModalComponent,
    InputComponent,
    SelectComponent
  ],
  templateUrl: './visitor-events-insiders.component.html',
  styleUrls: ['./visitor-events-insiders.component.scss']
})
export class VisitorEventsInsidersComponent {
  @ViewChild('insidersTable') insidersTable?: DataTableComponent;
  @ViewChild('visitorTable') visitorTable?: DataTableComponent;
  @ViewChild('movementDetailsTable') movementDetailsTable?: DataTableComponent;
  @ViewChild('visitedEmployeeSelect') visitedEmployeeSelect?: SelectComponent;

  private apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
  private isReloading = false;

  // Main grid columns
  tableColumns: TableColumn[] = insidersColumns;

  // Visitor list modal grid columns (left)
  visitorTableColumns: TableColumn[] = [
    { field: 'EmployeeID', label: 'Kişi No', text: 'Kişi No', type: 'int', sortable: true, width: '90px', size: '90px', searchable: 'int', resizable: true },
    { field: 'IdentificationNumber', label: 'Kimlik Numarası', text: 'Kimlik Numarası', type: 'text', sortable: true, width: '160px', size: '160px', searchable: 'text', resizable: true },
    { field: 'Name', label: 'Adı', text: 'Adı', type: 'text', sortable: true, width: '140px', size: '140px', searchable: 'text', resizable: true },
    { field: 'SurName', label: 'Soyad', text: 'Soyad', type: 'text', sortable: true, width: '140px', size: '140px', searchable: 'text', resizable: true },
    { field: 'InDate', label: 'Giriş', text: 'Giriş', type: 'datetime', sortable: true, width: '180px', size: '180px', searchable: 'datetime', resizable: true }
  ];

  // Movement details modal grid columns
  movementDetailsColumns: TableColumn[] = [
    { field: 'LocationName', label: 'Lokasyon', text: 'Lokasyon', type: 'text', sortable: true, width: '200px', size: '200px', searchable: 'text', resizable: true },
    { field: 'EventDate', label: 'Tarih/Saat', text: 'Tarih/Saat', type: 'datetime', sortable: true, width: '180px', size: '180px', searchable: 'datetime', resizable: true },
    { field: 'EventType', label: 'Giriş/Çıkış', text: 'Giriş/Çıkış', type: 'text', sortable: true, width: '120px', size: '120px', searchable: 'text', resizable: true }
  ];

  // Modal state
  showEntryModal = false;
  showMovementDetailsModal = false;
  isSubmitting = false;

  /** Visitor grid height - 100% fills container; emptyRowsCount uses wrapper's actual height */
  readonly entryModalGridHeight = '100%';

  @HostListener('window:resize')
  onWindowResize(): void {
    this.cdr.markForCheck();
  }
  selectedVisitId: number | null = null;

  // Select options
  companyOptions: SelectOption[] = [];
  visitedEmployeeOptions: SelectOption[] = [];
  visitedEmployeeSearchTerm$ = new Subject<string>();
  isLoadingVisitedEmployees = false;
  visitorCardOptions: SelectOption[] = [];
  accessGroupOptions: SelectOption[] = [];
  outputGroupOptions: SelectOption[] = [];
  /** Çıkış Grubu alanı sadece SystemType ROSSLARE ise gösterilir */
  showOutputGroup = false;

  entryForm: FormGroup = this.fb.group({
    EmployeeID: [{ value: null, disabled: true }],
    Name: ['', [Validators.required]],
    SurName: ['', [Validators.required]],
    IdentificationNumber: [''],
    Company: [''],
    CompanyId: [null, [Validators.required]],
    VisitedEmployeeID: [null],
    Description: [''],
    AccessGroupID: [null],
    OutputGroupId: [null],
    VisitorCard: [null]
  });

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    // Company changes: clear visited employee select; results will come via search
    this.entryForm.get('CompanyId')?.valueChanges.subscribe((companyId) => {
      this.visitedEmployeeOptions = [];
      this.entryForm.patchValue({ VisitedEmployeeID: null }, { emitEvent: false });
      // Clear search term when company changes to force fresh search
      this.visitedEmployeeSearchTerm$.next('');
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    const currentSetting = environment.settings[environment.setting as keyof typeof environment.settings] as { systemType?: string };
    this.showOutputGroup = currentSetting?.systemType === 'ROSSLARE';
    // Setup "Visited Employee" search with debounce (like card assignment)
    this.setupVisitedEmployeeSearch();
  }

  private setupVisitedEmployeeSearch(): void {
    const companyId$ = (this.entryForm.get('CompanyId')?.valueChanges ?? of(null)).pipe(
      startWith(this.entryForm.get('CompanyId')?.value ?? null)
    );
    const searchTerm$ = this.visitedEmployeeSearchTerm$.pipe(
      startWith(''),
      debounceTime(300)
    );

    combineLatest([companyId$, searchTerm$])
      .pipe(
        switchMap(([companyId, searchTerm]) => {
          if (!companyId) {
            this.visitedEmployeeOptions = [];
            this.isLoadingVisitedEmployees = false;
            this.cdr.markForCheck();
            return of([] as SelectOption[]);
          }

          if (!searchTerm || String(searchTerm).trim().length < 2) {
            this.visitedEmployeeOptions = [];
            this.isLoadingVisitedEmployees = false;
            this.cdr.markForCheck();
            return of([] as SelectOption[]);
          }

          this.isLoadingVisitedEmployees = true;
          this.cdr.markForCheck();

          return this.http
            .post<any>(`${this.apiUrl}/api/Employees/find`, {
              search: String(searchTerm).trim(),
              limit: 50,
              offset: 0,
              CompanyId: companyId,
              CompanyID: companyId,
              PdksCompanyID: companyId,
              PdksCompanyId: companyId
            })
            .pipe(
              map((res) => this.extractRecords(res)),
              map((records) => {
                const term = String(searchTerm).trim().toLowerCase();
                const filtered = records.filter((x: AnyRecord) => {
                  const name = String(x['Name'] ?? '');
                  const surname = String(x['SurName'] ?? '');
                  const full = `${name} ${surname}`.trim().toLowerCase();
                  const idNo = String(x['IdentificationNumber'] ?? '').toLowerCase();
                  return full.includes(term) || idNo.includes(term);
                });

                return filtered.slice(0, 50).map((x: AnyRecord) => {
                  const id = x['EmployeeID'] ?? x['Id'] ?? x['id'];
                  return {
                    value: id != null ? Number(id) : null,
                    label:
                      `${x['Name'] ?? ''} ${x['SurName'] ?? ''}`.trim() ||
                      (x['FullName'] ?? String(id))
                  };
                });
              }),
              catchError((error) => {
                console.error('Load visited employees (search) error:', error);
                return of([] as SelectOption[]);
              })
            );
        })
      )
      .subscribe((opts: SelectOption[]) => {
        this.isLoadingVisitedEmployees = false;
        this.visitedEmployeeOptions = opts;
        this.cdr.markForCheck();
      });
  }

  // Main insiders grid datasource
  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${this.apiUrl}/api/Employees/GetAllInsiderVisitor`, {
      page: params.page || 1,
      limit: params.limit || 100,
      offset: ((params.page || 1) - 1) * (params.limit || 100),
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
      catchError((error) => {
        console.error('Error loading insider visitors:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Visitor list grid datasource (modal)
  visitorListDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${this.apiUrl}/api/Employees/GetAllVisitor`, {
      page: params.page || 1,
      limit: params.limit || 100,
      offset: ((params.page || 1) - 1) * (params.limit || 100),
      search: params.search || undefined,
      searchLogic: params.searchLogic || 'AND',
      sort: params.sort,
      join: params.join,
      showDeleted: params.showDeleted,
      columns: this.visitorTableColumns
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError((error) => {
        console.error('Error loading visitor list:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Toolbar configuration
  get tableToolbarConfig(): ToolbarConfig {
    return {
      items: [
        { id: 'entryVisitor', type: 'button', text: 'Ziyaretçi Giriş', icon: 'plus', onClick: () => this.openEntryModal() },
        { id: 'exitVisitor', type: 'button', text: 'Ziyaretçi Çıkış', onClick: () => this.exitSelectedVisitor() },
        { id: 'movementDetails', type: 'button', text: 'Hareket Detayları', icon: 'info-circle', onClick: () => this.openMovementDetailsModal() }
      ],
      show: { reload: true, columns: true, search: true, add: false, edit: false, delete: false, save: false }
    };
  }

  // ===== Events from main table =====
  onTableRefresh(): void {
    if (!this.isReloading && this.insidersTable) {
      this.isReloading = true;
      setTimeout(() => (this.isReloading = false), 800);
    }
  }
  onTableRowClick(_: any): void {}
  onTableRowDblClick(_: any): void {}
  onTableRowSelect(_: TableRow[]): void {}
  onAdvancedFilterChange(_: any): void {}

  // ===== Entry (AddVisit) modal =====
  openEntryModal(): void {
    this.showEntryModal = true;
    this.resetEntryForm();
    // Explicitly set CompanyId to null/empty when modal opens
    const companyIdControl = this.entryForm.get('CompanyId');
    if (companyIdControl) {
      companyIdControl.setValue(null, { emitEvent: false });
    }
    // Clear visited employee options to force fresh search
    this.visitedEmployeeOptions = [];
    this.isLoadingVisitedEmployees = false;
    // Clear search term to reset search state
    this.visitedEmployeeSearchTerm$.next('');
    // Clear select component's search input
    setTimeout(() => {
      if (this.visitedEmployeeSelect) {
        this.visitedEmployeeSelect.clearSearch();
      }
    }, 50);
    // load dropdown options lazily
    this.loadCompaniesIfNeeded();
    // Always reload visitor cards when modal opens
    this.loadVisitorCards();
    // Load access groups from API
    this.loadAccessGroups();
    if (this.showOutputGroup) {
      this.loadOutputGroups();
    }
    // Reload visitor grid after modal is rendered
    setTimeout(() => {
      if (this.visitorTable) {
        this.visitorTable.reload();
      }
    }, 100);
    
    this.cdr.markForCheck();
  }

  onEntryModalShowChange(show: boolean): void {
    if (!show) {
      this.closeEntryModal();
      return;
    }
    this.showEntryModal = true;
    // Modal her açıldığında (daha önce açıldıysa dahil) girilen değerleri sıfırla
    this.resetEntryForm();
    this.visitedEmployeeOptions = [];
    this.visitedEmployeeSearchTerm$.next('');
    setTimeout(() => {
      if (this.visitedEmployeeSelect) {
        this.visitedEmployeeSelect.clearSearch();
      }
    }, 50);
    this.loadCompaniesIfNeeded();
    this.loadVisitorCards();
    this.loadAccessGroups();
    if (this.showOutputGroup) {
      this.loadOutputGroups();
    }
    setTimeout(() => {
      if (this.visitorTable) {
        this.visitorTable.reload();
      }
    }, 100);
    this.cdr.markForCheck();
  }

  closeEntryModal(): void {
    this.showEntryModal = false;
    this.isSubmitting = false;
    this.isLoadingVisitedEmployees = false;
    this.cdr.markForCheck();
  }

  onVisitorRowDblClick(row: TableRow): void {
    // Double-click functionality removed - use Select button instead
  }

  onVisitorSelectClick(): void {
    // Get selected row from visitor table
    if (!this.visitorTable) {
      this.toastr.warning('Ziyaretçi tablosu bulunamadı.');
      return;
    }

    const selectedRows = this.visitorTable.selectedRows;
    if (!selectedRows || selectedRows.size === 0) {
      this.toastr.warning('Lütfen 1 adet ziyaretçi seçiniz.');
      return;
    }

    if (selectedRows.size !== 1) {
      this.toastr.warning('Lütfen 1 adet ziyaretçi seçiniz.');
      return;
    }

    // Get selected ID
    const selectedIds = Array.from(selectedRows);
    const selectedId = selectedIds[0];

    // Get data source - use filteredData (getter) which handles dataSource vs data input
    // This matches how DataTableComponent finds selected rows internally
    const dataSource = this.visitorTable.filteredData || this.visitorTable.data || [];

    if (!dataSource || dataSource.length === 0) {
      console.warn('onVisitorSelectClick: No data source available', {
        filteredData: this.visitorTable.filteredData?.length,
        data: this.visitorTable.data?.length,
        internalData: this.visitorTable.internalData?.length
      });
      this.toastr.warning('Veri bulunamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.');
      return;
    }

    // Get recid field name (same logic as DataTableComponent.getRowId)
    const recidField = this.visitorTable.recid || 'id';

    // Find the selected row using the same logic as DataTableComponent.getRowId
    // This ensures we match the ID format used in selectedRows Set
    const row = dataSource.find((r: any) => {
      // Same logic as getRowId: row['recid'] ?? row[recidField] ?? row['id'] ?? row['_id'] ?? JSON.stringify(row)
      const rowId = r['recid'] ?? r[recidField] ?? r['id'] ?? r['_id'] ?? JSON.stringify(r);
      // Compare both as-is and as strings to handle type mismatches
      return rowId === selectedId || String(rowId) === String(selectedId);
    });

    if (!row) {
      console.warn('onVisitorSelectClick: row not found', {
        selectedId,
        selectedIdType: typeof selectedId,
        recidField,
        dataSourceLength: dataSource.length,
        sampleRowIds: dataSource.slice(0, 3).map((r: any) => ({
          recid: r['recid'],
          [recidField]: r[recidField],
          id: r['id'],
          _id: r['_id']
        }))
      });
      this.toastr.warning('Seçili ziyaretçi bulunamadı.');
      return;
    }

    // Extract employee data
    const employeeId = row['EmployeeID'] ?? row['Id'] ?? row['id'] ?? row['recid'] ?? null;
    //entryform clear and load visitor data
    this.entryForm.reset();
    
    // Enable EmployeeID control temporarily to set its value
    const employeeIdControl = this.entryForm.get('EmployeeID');
    if (employeeIdControl) {
      employeeIdControl.enable({ emitEvent: false });
      // Use setValue for disabled controls to ensure UI updates
      employeeIdControl.setValue(employeeId, { emitEvent: false });
      // Disable again after setting value
      employeeIdControl.disable({ emitEvent: false });
    }
    
    // Patch form values with visitor data
    this.entryForm.patchValue(
      {
        Name: row['Name'] ?? '',
        SurName: row['SurName'] ?? '',
        IdentificationNumber: row['IdentificationNumber'] ?? '',
        Company: row['VisitorCompany'] ?? ''
      },
      { emitEvent: false } // Don't emit events to avoid triggering validations prematurely
    );

    // Update form validity and trigger change detection
    this.entryForm.updateValueAndValidity({ emitEvent: false });
    
    // Force change detection to refresh the form and UI components (OnPush strategy)
    this.cdr.markForCheck();
    setTimeout(() => {
      this.cdr.detectChanges();
      this.cdr.markForCheck();
    }, 0);
  }

  // Visitor table toolbar configuration
  get visitorTableToolbarConfig(): ToolbarConfig {
    return {
      items: [
        { id: 'selectVisitor', type: 'button', text: 'Seç', icon: 'check', onClick: () => this.onVisitorSelectClick() }
      ],
      show: { reload: true, columns: true, search: true, add: false, edit: false, delete: false, save: false }
    };
  }

  submitEntry(): void {
    if (this.isSubmitting) return;
    if (this.entryForm.invalid) {
      this.toastr.warning('Lütfen zorunlu alanları doldurunuz.');
      return;
    }

    this.isSubmitting = true;
    const record = this.entryForm.getRawValue();

    this.http
      .post<any>(`${this.apiUrl}/api/VisitorEvents/AddVisit`, record)
      .pipe(
        catchError((error) => {
          console.error('AddVisit error:', error);
          const msg = error?.error?.message || error?.message || 'Ziyaretçi giriş işlemi başarısız.';
          this.toastr.error(msg, this.translate.instant('common.error'));
          this.isSubmitting = false;
          this.cdr.markForCheck();
          return of(null);
        })
      )
      .subscribe((res) => {
        this.isSubmitting = false;
        if (!res) return;
        if (res.success === true || res.error === false || res.status === 'success') {
          this.toastr.success(res.message || 'İşlem başarılı.', this.translate.instant('common.success'));
          this.closeEntryModal();
          this.reloadInsiders();
        } else {
          this.toastr.error(res.message || 'İşlem başarısız.', this.translate.instant('common.error'));
        }
        this.cdr.markForCheck();
      });
  }

  private resetEntryForm(): void {
    // Clear visited employee options first
    this.visitedEmployeeOptions = [];
    this.isLoadingVisitedEmployees = false;
    // Clear search term to reset search state
    this.visitedEmployeeSearchTerm$.next('');
    // Reset form with explicit null values
    this.entryForm.reset({
      EmployeeID: null,
      Name: '',
      SurName: '',
      IdentificationNumber: '',
      Company: '',
      CompanyId: null,
      VisitedEmployeeID: null,
      Description: '',
      AccessGroupID: null,
      OutputGroupId: null,
      VisitorCard: null
    }, { emitEvent: false });
    
    // Explicitly set CompanyId to null to ensure it's empty
    const companyIdControl = this.entryForm.get('CompanyId');
    if (companyIdControl) {
      companyIdControl.setValue(null, { emitEvent: false });
    }
  }

  onVisitedEmployeeSearchChange(searchTerm: string): void {
    // Always emit search term to observable, even if it's the same value
    // This ensures search works even when company doesn't change
    this.visitedEmployeeSearchTerm$.next(searchTerm || '');
  }

  onVisitedEmployeeChange(value: number | null): void {
    // valueChange ile form değerini açıkça güncelle (ControlValueAccessor senkronizasyon sorunlarını önler)
    this.entryForm.patchValue({ VisitedEmployeeID: value }, { emitEvent: false });
  }

  // ===== Exit visitor =====
  exitSelectedVisitor(): void {
    if (!this.insidersTable) {
      this.toastr.warning('Tablo bulunamadı.');
      return;
    }
    const selectedIds = Array.from(this.insidersTable.selectedRows || []);
    if (selectedIds.length !== 1) {
      this.toastr.warning('Lütfen 1 adet kayıt seçiniz.');
      return;
    }
    
    // Get selected row to get the record ID
    const selectedId = selectedIds[0];
    const dataSource = this.insidersTable.filteredData || this.insidersTable.data || [];
    const selectedRow = dataSource.find((row: any) => {
      const rowId = row['ID'] ?? row['recid'] ?? row['id'];
      return rowId === selectedId;
    });
    
    // Use record['ID'] as requested
    const recordId = selectedRow?.['ID'] ?? selectedId;
    
    if (!recordId) {
      this.toastr.warning('Seçili kayıtta ID bulunamadı.');
      return;
    }
    
    const confirmed = window.confirm('Seçili olan ziyaretçi çıkışı yapılacaktır. Onaylıyor musunuz?');
    if (!confirmed) return;

    this.http
      .post<any>(`${this.apiUrl}/api/VisitorEvents/ExitVisitor`, { id: recordId })
      .pipe(
        catchError((error) => {
          console.error('ExitVisitor error:', error);
          const msg = error?.error?.message || error?.message || 'Ziyaretçi çıkış işlemi başarısız.';
          this.toastr.error(msg, this.translate.instant('common.error'));
          return of(null);
        })
      )
      .subscribe((res) => {
        if (!res) return;
        if (res.success === true || res.error === false || res.status === 'success') {
          this.toastr.success(res.message || 'İşlem başarılı.', this.translate.instant('common.success'));
          this.reloadInsiders();
        } else {
          this.toastr.error(res.message || 'İşlem başarısız.', this.translate.instant('common.error'));
        }
      });
  }

  private reloadInsiders(): void {
    if (!this.insidersTable) return;
    if (this.isReloading) return;
    this.isReloading = true;
    setTimeout(() => {
      this.insidersTable?.reload();
      setTimeout(() => {
        this.isReloading = false;
        this.cdr.markForCheck();
      }, 400);
    }, 50);
  }

  // ===== Option loaders =====
  private loadCompaniesIfNeeded(): void {
    if (this.companyOptions.length > 0) return;
    this.http
      .post<any>(`${this.apiUrl}/api/PdksCompanys`, { limit: -1, offset: 0 })
      .pipe(
        map((res) => this.extractRecords(res)),
        map((records) =>
          records.map((x: AnyRecord) => ({
            value: x['PdksCompanyID'] ?? x['Id'] ?? x['id'],
            label:
              x['PdksCompanyName'] ??
              x['Name'] ??
              x['text'] ??
              String(x['PdksCompanyID'] ?? x['Id'] ?? x['id'])
          }))
        ),
        catchError((error) => {
          console.error('Load companies error:', error);
          return of([] as SelectOption[]);
        })
      )
      .subscribe((opts) => {
        this.companyOptions = opts;
        this.cdr.markForCheck();
      });
  }

  // NOTE: Visited employee list is loaded via search (see ngOnInit)

  private loadVisitorCardsIfNeeded(): void {
    if (this.visitorCardOptions.length > 0) return;
    this.loadVisitorCards();
  }

  private loadVisitorCards(): void {
    this.http
      .post<any>(`${this.apiUrl}/api/Cards/NonUsedVisitorCards`, { limit: -1, offset: 0 })
      .pipe(
        map((res) => this.extractRecords(res)),
        map((records) =>
          records.map((x: AnyRecord) => ({
            value: x['CardID'] ?? x['id'] ?? x['Id'] ?? x['value'],
            // UI request: only show CardDesc in the select list
            label: String(x['CardDesc'] ?? '').trim() || '-'
          }))
        ),
        catchError((error) => {
          console.error('Load visitor cards error:', error);
          return of([] as SelectOption[]);
        })
      )
      .subscribe((opts) => {
        this.visitorCardOptions = opts;
        this.cdr.markForCheck();
      });
  }

  private loadAccessGroups(): void {
    this.http
      .post<any>(`${this.apiUrl}/api/AccessGroups`, { limit: -1, offset: 0 })
      .pipe(
        map((res) => this.extractRecords(res)),
        map((records) =>
          records.map((x: AnyRecord) => ({
            value: x['AccessGroupID'] ?? x['Id'] ?? x['id'],
            label: x['AccessGroupName'] ?? x['Name'] ?? String(x['AccessGroupID'] ?? x['Id'] ?? x['id'])
          }))
        ),
        catchError((error) => {
          console.error('Load access groups error:', error);
          return of([] as SelectOption[]);
        })
      )
      .subscribe((opts) => {
        this.accessGroupOptions = opts;
        this.cdr.markForCheck();
      });
  }

  private loadOutputGroups(): void {
    this.http
      .post<any>(`${this.apiUrl}/api/Terminals/GetAllOutputGroups`, {})
      .pipe(
        map((res) => {
          const list = res?.data ?? res?.records ?? (Array.isArray(res) ? res : []);
          return Array.isArray(list) ? list : [];
        }),
        map((records: AnyRecord[]) =>
          records.map((x) => ({
            value: x['SerialNumber'],
            label: x['Name'] ?? x['tDesc'] ?? String(x['SerialNumber'])
          }))
        ),
        catchError((error) => {
          console.error('Load output groups error:', error);
          return of([] as SelectOption[]);
        })
      )
      .subscribe((opts) => {
        this.outputGroupOptions = opts;
        this.cdr.markForCheck();
      });
  }

  private extractRecords(res: any): AnyRecord[] {
    if (!res) return [];
    if (Array.isArray(res)) return res as AnyRecord[];
    if (Array.isArray(res.records)) return res.records as AnyRecord[];
    if (Array.isArray(res.data)) return res.data as AnyRecord[];
    if (res.data && Array.isArray(res.data.data)) return res.data.data as AnyRecord[];
    return [];
  }

  // ===== Movement Details Modal =====
  openMovementDetailsModal(): void {
    if (!this.insidersTable) {
      this.toastr.warning('Tablo bulunamadı.');
      return;
    }
    const selectedIds = Array.from(this.insidersTable.selectedRows || []);
    if (selectedIds.length !== 1) {
      this.toastr.warning('Lütfen 1 adet kayıt seçiniz.');
      return;
    }
    
    // Get selected row to get the record ID
    const selectedId = selectedIds[0];
    const dataSource = this.insidersTable.filteredData || this.insidersTable.data || [];
    const selectedRow = dataSource.find((row: any) => {
      const rowId = row['ID'] ?? row['recid'] ?? row['id'];
      return rowId === selectedId;
    });
    
    // Use record['ID'] as requested (not EmployeeID)
    const recordId = selectedRow?.['ID'] ?? selectedId;
    
    if (!recordId) {
      this.toastr.warning('Seçili kayıtta ID bulunamadı.');
      return;
    }

    this.selectedVisitId = recordId;
    this.showMovementDetailsModal = true;
    this.cdr.markForCheck();
    
    // Reload movement details grid after a short delay to ensure modal is rendered
    setTimeout(() => {
      if (this.movementDetailsTable) {
        this.movementDetailsTable.reload();
      }
    }, 100);
  }

  onMovementDetailsModalShowChange(show: boolean): void {
    if (!show) {
      this.closeMovementDetailsModal();
      return;
    }
    this.showMovementDetailsModal = true;
    this.cdr.markForCheck();
  }

  closeMovementDetailsModal(): void {
    this.showMovementDetailsModal = false;
    this.selectedVisitId = null;
    this.cdr.markForCheck();
  }

  // Movement details grid datasource
  movementDetailsDataSource = (params: any) => {
    if (!this.selectedVisitId) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }

    return this.http.get<any>(`${this.apiUrl}/api/VisitorEvents/Moments/${this.selectedVisitId}`).pipe(
      map((response: any) => {
        // API response'u grid formatına çevir
        let records: AnyRecord[] = [];
        
        if (Array.isArray(response)) {
          records = response;
        } else if (Array.isArray(response.records)) {
          records = response.records;
        } else if (Array.isArray(response.data)) {
          records = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          records = response.data.data;
        }

        // EventType'ı Türkçe'ye çevir (eğer gerekirse)
        records = records.map((rec: AnyRecord) => {
          const eventType = String(rec['EventType'] ?? rec['eventType'] ?? '').toLowerCase();
          let eventTypeText = rec['EventType'] ?? rec['eventType'] ?? '';
          
          if (eventType === 'in' || eventType === 'entry' || eventType === 'giriş') {
            eventTypeText = 'Giriş';
          } else if (eventType === 'out' || eventType === 'exit' || eventType === 'çıkış') {
            eventTypeText = 'Çıkış';
          }
          
          return {
            ...rec,
            EventType: eventTypeText,
            LocationName: rec['LocationName'] ?? rec['locationName'] ?? rec['Location'] ?? rec['location'] ?? '',
            EventDate: rec['EventDate'] ?? rec['eventDate'] ?? rec['Date'] ?? rec['date'] ?? rec['DateTime'] ?? rec['dateTime'] ?? ''
          };
        });

        return {
          status: 'success' as const,
          total: records.length,
          records: records
        } as GridResponse;
      }),
      catchError((error) => {
        console.error('Error loading movement details:', error);
        const msg = error?.error?.message || error?.message || 'Hareket detayları yüklenirken hata oluştu.';
        this.toastr.error(msg, this.translate.instant('common.error'));
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };
}

