// Günlük Yoklama — POST AccessEvents/PersonalDailyAttendence
// Filtre: varsayılan data-table yapısı (search.logic + search.conditions), InsideOutsideReports ile aynı işleme.
import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { joinOptions } from './daily-attendance-reports-config';
import { tableColumns, ymdFromFilterValue } from './daily-attendance-reports-table-columns';
import {
  formFields,
  formTabs,
  formLoadUrl,
  formLoadRequest,
  formDataMapper
} from './daily-attendance-reports-form-config';
import {
  DataTableComponent,
  TableColumn,
  ToolbarConfig,
  GridResponse,
  JoinOption,
  FormTab,
  TableRow
} from 'src/app/components/data-table/data-table.component';

@Component({
  selector: 'app-daily-attendance-reports',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule, DataTableComponent],
  templateUrl: './daily-attendance-reports.component.html',
  styleUrls: ['./daily-attendance-reports.component.scss']
})
export class DailyAttendanceReportsComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  private isReloading: boolean = false;

  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;

  /** Excel/PDF export — /api/Exports için veri kaynağı URL (dataSource toString ile çıkarılamaz). */
  reportConfig = {
    grid: 'daily-attendance-reports-grid',
    url: `/api/AccessEvents/PersonalDailyAttendence`
  };

  private readonly apiUrl =
    `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/AccessEvents/PersonalDailyAttendence`;

  /** Backend Y-m-d bekliyorsa: filtredeki startDate / endDate koşullarından (search silinmeden) üst düzey alan üretir. */
  private topLevelDatesFromSearch(processedSearch: any): { startDate?: string; endDate?: string } {
    const out: { startDate?: string; endDate?: string } = {};
    const conditions = processedSearch?.conditions;
    if (!Array.isArray(conditions)) {
      return out;
    }
    for (const c of conditions) {
      const f = c.field;
      if (f === 'startDate' && c.value != null && c.value !== '') {
        out.startDate = ymdFromFilterValue(c.value);
      }
      if (f === 'endDate' && c.value != null && c.value !== '') {
        out.endDate = ymdFromFilterValue(c.value);
      }
    }
    return out;
  }

  private getDefaultDateRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { startDate: fmt(first), endDate: fmt(last) };
  }

  tableDataSource = (params: any) => {

    let join = params.join;
    if (!join || Object.keys(join).length === 0) {
      join = { Employee: true };
    }

    return this.http.post<any>(this.apiUrl, params).pipe(
      tap((res) => {
        if (res?.status === 'error' && res?.message) {
          this.toastr.warning(res.message, this.translate.instant('common.warning'));
        }
      }),
      map((response: any) => {
        if (response.status !== 'success') {
          return { status: 'error' as const, total: 0, records: [] } as GridResponse;
        }
        let totalValue: number;
        if (response.total != null) {
          totalValue = response.total;
        } else if (response.count != null) {
          totalValue = response.count;
        } else if (response.totalCount != null) {
          totalValue = response.totalCount;
        } else {
          totalValue = response.records?.length ?? 0;
        }
        const raw = response.records || [];
        const records: TableRow[] = raw.map((r: any, i: number) => ({
          ...r,
          _rowKey: `${r.EmployeeID ?? ''}_${String(r.Day ?? '')}_${i}`
        }));
        return {
          status: 'success' as const,
          total: totalValue,
          records
        } as GridResponse;
      }),
      catchError((err) => {
        console.error('Günlük Yoklama raporu yüklenemedi:', err);
        const msg =
          err?.error?.message ??
          err?.error?.Message ??
          err?.message ??
          'Veri yüklenemedi.';
        this.toastr.warning(msg, this.translate.instant('common.warning'));
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  get tableToolbarConfig(): ToolbarConfig {
    return {
      items: [],
      show: {
        reload: true,
        columns: true,
        search: true,
        add: false,
        edit: false,
        delete: false,
        save: false
      }
    };
  }

  onSave = (): Observable<any> =>
    of({ error: true, message: 'Günlük Yoklama raporu sadece görüntüleme amaçlıdır.' });

  onFormChange = (_formData: any) => {};

  constructor(
    private http: HttpClient,
    public translate: TranslateService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  onTableRowClick(_event: any): void {}
  onTableRowDblClick(_event: any): void {}
  onTableRowSelect(_event: TableRow[]): void {}
  onTableRefresh(): void {
    if (!this.isReloading && this.dataTableComponent) {
      this.isReloading = true;
      setTimeout(() => {
        this.isReloading = false;
      }, 1000);
    }
  }
  onTableDelete(_event: any): void {}
  onTableAdd(): void {}
  onTableEdit(_event: any): void {}
  onAdvancedFilterChange(_event: any): void {}
}
