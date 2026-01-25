// VisitorEvents-Insiders Component (İçerideki Ziyaretçiler)
import { Component, ChangeDetectorRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
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

  // Modal state
  showEntryModal = false;
  isSubmitting = false;

  // Select options
  companyOptions: SelectOption[] = [];
  visitedEmployeeOptions: SelectOption[] = [];
  visitedEmployeeSearchTerm$ = new Subject<string>();
  isLoadingVisitedEmployees = false;
  visitorCardOptions: SelectOption[] = [];
  accessGroupOptions: SelectOption[] = [
    { value: 1, label: 'ARAC GIRISLERI' },
    { value: 2, label: 'TURNIKELER' },
    { value: 3, label: 'ENGELLI TURNIKELER' },
    { value: 4, label: 'TUM KAPILAR' },
    { value: 5, label: 'BILGI ISLEM' },
    { value: 6, label: 'DENEY HAYVANLARI' },
    { value: 7, label: 'REKTORLUK' },
    { value: 8, label: 'GIDA LAB' },
    { value: 9, label: 'EGİTİM 1' },
    { value: 10, label: 'EGİTİM 2' },
    { value: 11, label: 'EGİTİM 3' },
    { value: 12, label: 'MÜHENDİSLİK LAB' },
    { value: 15, label: 'ANA NİZAMİYE ZİYARETCİ KARTI' },
    { value: 16, label: 'VETERİNERLİK NİZAMİYE ZİYARETÇİ KARTI' },
    { value: 17, label: 'BESYO NİZAMİYE' },
    { value: 18, label: 'UNİYURT NİZAMİYE' },
    { value: 19, label: 'PERSONEL' },
    { value: 20, label: 'KYK NİZAMİYE' },
    { value: 25, label: 'TURNİKELER2' },
    { value: 26, label: 'Deneme' },
    { value: 28, label: 'HGS KGS' },
    { value: 29, label: 'Misafir' }
  ];

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
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    // Setup "Visited Employee" search with debounce (like card assignment)
    this.visitedEmployeeSearchTerm$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm) => {
          const companyId = this.entryForm.get('CompanyId')?.value;

          if (!companyId) {
            this.visitedEmployeeOptions = [];
            this.isLoadingVisitedEmployees = false;
            this.cdr.markForCheck();
            return of([] as SelectOption[]);
          }

          if (!searchTerm || searchTerm.trim().length < 2) {
            this.visitedEmployeeOptions = [];
            this.isLoadingVisitedEmployees = false;
            this.cdr.markForCheck();
            return of([] as SelectOption[]);
          }

          this.isLoadingVisitedEmployees = true;
          this.cdr.markForCheck();

          // Backend pattern (like card assignment): POST /api/Employees/find
          // CompanyId is sent in body to filter results.
          return this.http
            .post<any>(`${this.apiUrl}/api/Employees/find`, {
              search: searchTerm.trim(),
              limit: 50,
              offset: 0,
              // Send a few common variants; backend will use what it knows.
              CompanyId: companyId,
              CompanyID: companyId,
              PdksCompanyID: companyId,
              PdksCompanyId: companyId
            })
            .pipe(
              map((res) => this.extractRecords(res)),
              map((records) => {
                const term = searchTerm.trim().toLowerCase();
                const filtered = records.filter((x: AnyRecord) => {
                  const name = String(x['Name'] ?? '');
                  const surname = String(x['SurName'] ?? '');
                  const full = `${name} ${surname}`.trim().toLowerCase();
                  const idNo = String(x['IdentificationNumber'] ?? '').toLowerCase();
                  return full.includes(term) || idNo.includes(term);
                });

                return filtered.slice(0, 50).map((x: AnyRecord) => ({
                  value: x['EmployeeID'] ?? x['Id'] ?? x['id'],
                  label:
                    `${x['Name'] ?? ''} ${x['SurName'] ?? ''}`.trim() ||
                    (x['FullName'] ?? String(x['EmployeeID'] ?? x['Id'] ?? x['id']))
                }));
              }),
              catchError((error) => {
                console.error('Load visited employees (search) error:', error);
                return of([] as SelectOption[]);
              })
            );
        })
      )
      .subscribe((opts) => {
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
        { id: 'exitVisitor', type: 'button', text: 'Ziyaretçi Çıkış', onClick: () => this.exitSelectedVisitor() }
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
    // load dropdown options lazily
    this.loadCompaniesIfNeeded();
    this.loadVisitorCardsIfNeeded();
    this.cdr.markForCheck();
  }

  onEntryModalShowChange(show: boolean): void {
    if (!show) {
      this.closeEntryModal();
      return;
    }
    this.showEntryModal = true;
    this.cdr.markForCheck();
  }

  closeEntryModal(): void {
    this.showEntryModal = false;
    this.isSubmitting = false;
    this.isLoadingVisitedEmployees = false;
    this.cdr.markForCheck();
  }

  onVisitorRowDblClick(row: TableRow): void {
    // Prefill form from selected visitor record (old behavior)
    const employeeId = row['EmployeeID'] ?? row['Id'] ?? row['id'] ?? null;
    this.entryForm.patchValue(
      {
        EmployeeID: employeeId,
        Name: row['Name'] ?? '',
        SurName: row['SurName'] ?? '',
        IdentificationNumber: row['IdentificationNumber'] ?? '',
        Company: row['VisitorCompany'] ?? row['Company'] ?? ''
      },
      { emitEvent: true }
    );
    this.cdr.markForCheck();
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
      VisitorCard: null
    });
    this.visitedEmployeeOptions = [];
    this.isLoadingVisitedEmployees = false;
  }

  onVisitedEmployeeSearchChange(searchTerm: string): void {
    this.visitedEmployeeSearchTerm$.next(searchTerm);
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
    const id = selectedIds[0];
    const confirmed = window.confirm('Seçili olan ziyaretçi çıkışı yapılacaktır. Onaylıyor musunuz?');
    if (!confirmed) return;

    this.http
      .post<any>(`${this.apiUrl}/api/VisitorEvents/ExitVisitor`, { id })
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
    this.http
      .post<any>(`${this.apiUrl}/api/Cards/NonUsedVisitorCards`, { limit: -1, offset: 0 })
      .pipe(
        map((res) => this.extractRecords(res)),
        map((records) =>
          records.map((x: AnyRecord) => ({
            value: x['CardID'] ?? x['id'] ?? x['Id'] ?? x['value'],
            label: `CardID: ${x['CardID'] ?? x['id'] ?? x['Id'] ?? x['value']} | CardUID: ${String(x['CardUID'] ?? '').trim() || '-'} | CardDesc: ${String(x['CardDesc'] ?? '').trim() || '-'}`
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

  private extractRecords(res: any): AnyRecord[] {
    if (!res) return [];
    if (Array.isArray(res)) return res as AnyRecord[];
    if (Array.isArray(res.records)) return res.records as AnyRecord[];
    if (Array.isArray(res.data)) return res.data as AnyRecord[];
    if (res.data && Array.isArray(res.data.data)) return res.data.data as AnyRecord[];
    return [];
  }
}

