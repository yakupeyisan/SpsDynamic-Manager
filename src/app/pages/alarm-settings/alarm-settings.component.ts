// AlarmSettings Component (Alarm Tanımları)
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { joinOptions } from './alarm-settings-config';
import { tableColumns } from './alarm-settings-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './alarm-settings-form-config';
import { DataTableComponent, TableColumn, ToolbarConfig, ToolbarItem, GridResponse, JoinOption, FormTab } from 'src/app/components/data-table/data-table.component';

@Component({
  selector: 'app-alarm-settings',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule, DataTableComponent],
  templateUrl: './alarm-settings.component.html',
  styleUrls: ['./alarm-settings.component.scss']
})
export class AlarmSettingsComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  private isReloading: boolean = false;
  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;

  // Personel arama (free-card gibi: en az 2 karakter, /api/Employees/find)
  employees: { label: string; value: any }[] = [];
  employeeSearchTerm$ = new Subject<string>();
  isLoadingEmployees = false;
  private employeeSearchSub?: Subscription;

  get formFieldSearch(): Record<string, { options: { label: string; value: any }[]; placeholder: string; searchPlaceholder: string; onSearch: (term: string) => void; loading?: boolean }> {
    return {
      EmployeeID: {
        options: this.employees,
        placeholder: 'Personel ara... (en az 2 karakter)',
        searchPlaceholder: 'Personel ara...',
        onSearch: (term: string) => this.employeeSearchTerm$.next(term),
        loading: this.isLoadingEmployees
      }
    };
  }

  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Alarms`, {
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
        console.error('Error loading alarm settings:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  get tableToolbarConfig(): ToolbarConfig {
    return {
      items: [
        {
          id: 'toolabara-copy',
          type: 'button',
          text: 'Kopyala',
          icon: 'plus',
          tooltip: 'Ekleme formunu aç (birebir aynı)',
          onClick: (_event: MouseEvent, _item: ToolbarItem) => this.onTableCopy()
        }
      ],
      show: { reload: true, columns: true, search: true, add: true, edit: true, delete: true, save: false }
    };
  }

  onSave = (data: any, isEdit: boolean): Observable<any> => {
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Alarms/form`;
    const recid = data.AlarmID ?? data.recid ?? null;
    const { AlarmID, recid: _, ...record } = data;
    // Nested objeleri kayıt verisinden çıkar (API sadece düz alanları bekler)
    delete record.Employee;
    delete record.TimeZone;
    delete record.TaskScheduler;
    if (record.EventResult === 'true' || record.EventResult === 'false') {
      record.EventResult = record.EventResult === 'true';
    }
    // SchedulerTaskId: nullable int (number | null)
    if (record.SchedulerTaskId !== undefined) {
      record.SchedulerTaskId = record.SchedulerTaskId != null && record.SchedulerTaskId !== '' ? Number(record.SchedulerTaskId) : null;
    }
    return this.http.post(url, {
      request: { action: 'save', recid: recid, name: isEdit ? 'EditAlarm' : 'AddAlarm', record: record }
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

  ngOnInit(): void {
    this.employeeSearchSub = this.employeeSearchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => {
        if (!searchTerm || searchTerm.trim().length < 2) {
          this.employees = [];
          this.cdr.markForCheck();
          return of([]);
        }
        this.isLoadingEmployees = true;
        this.cdr.markForCheck();
        return this.http.post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/find`, {
          search: searchTerm.trim(),
          limit: 50,
          offset: 0
        }).pipe(
          map((response: any) => {
            let records: any[] = [];
            if (response?.records && Array.isArray(response.records)) records = response.records;
            else if (response?.data && Array.isArray(response.data)) records = response.data;
            else if (Array.isArray(response)) records = response;
            return records.map((item: any) => {
              const name = item.Name || '';
              const surname = item.SurName || '';
              const company = item.CompanyName || '';
              let label = `${name} ${surname}`.trim();
              if (company) label += ` - ${company}`;
              if (!label) label = `ID: ${item.EmployeeID}`;
              return { label, value: item.EmployeeID };
            });
          }),
          catchError(() => {
            this.toastr.error('Personel arama sırasında hata oluştu.', 'Hata');
            return of([]);
          })
        );
      })
    ).subscribe(employees => {
      this.isLoadingEmployees = false;
      this.employees = employees;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.employeeSearchSub?.unsubscribe();
  }
  onTableRowClick(event: any): void {}
  onTableRowDblClick(event: any): void {}
  onTableRowSelect(event: any): void {}
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
      const id = row.AlarmID ?? row.recid ?? row.id;
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

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Alarms/delete`, { request: { action: 'delete', recid: selectedIds } }).subscribe({
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

  onTableAdd(): void {
    this.employees = [];
    this.cdr.markForCheck();
    if (this.dataTableComponent) { this.dataTableComponent.openAddForm(); }
  }

  onTableCopy(): void {
    const record = this.dataTableComponent?.getSelectedRecord();
    if (!record) {
      this.toastr.warning(this.translate.instant('common.selectRow') ?? 'Kopyalamak için bir satır seçin.', this.translate.instant('common.warning') ?? 'Uyarı');
      return;
    }
    const emp = record?.['Employee'];
    const employeeId = record?.['EmployeeID'] ?? emp?.['EmployeeID'];
    if (emp && employeeId != null && employeeId !== '') {
      const label = [emp.Name, emp.SurName].filter(Boolean).join(' ').trim() || String(employeeId);
      this.employees = [{ label, value: employeeId }];
    } else {
      this.employees = [];
    }
    this.cdr.markForCheck();
    this.dataTableComponent?.openAddForm(record);
  }

  onTableEdit(event: any): void {
    const record = event?.selectedRecord ?? event;
    if (!record || !this.dataTableComponent) return;
    // Düzenlemede seçili personeli dropdown'da göstermek için options'a ekle
    const emp = record?.Employee;
    const employeeId = record?.EmployeeID ?? emp?.EmployeeID;
    if (emp && employeeId != null && employeeId !== '') {
      const label = [emp.Name, emp.SurName].filter(Boolean).join(' ').trim() || String(employeeId);
      this.employees = [{ label, value: employeeId }];
      this.cdr.markForCheck();
    } else {
      this.employees = [];
      this.cdr.markForCheck();
    }
    this.dataTableComponent.openEditForm(record);
  }
  onAdvancedFilterChange(event: any): void {}
}
