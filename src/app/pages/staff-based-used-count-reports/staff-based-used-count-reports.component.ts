// StaffBasedUsedCountReports Component
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
import { joinOptions } from './staff-based-used-count-reports-config';
import { tableColumns } from './staff-based-used-count-reports-table-columns';
import {
  formFields,
  formTabs,
  formLoadUrl,
  formLoadRequest,
  formDataMapper,
} from './staff-based-used-count-reports-form-config';
import {
  DataTableComponent,
  TableColumn,
  ToolbarConfig,
  GridResponse,
  JoinOption,
  FormTab,
  TableRow,
} from 'src/app/components/data-table/data-table.component';

@Component({
  selector: 'app-staff-based-used-count-reports',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    TablerIconsModule,
    TranslateModule,
    DataTableComponent,
  ],
  templateUrl: './staff-based-used-count-reports.component.html',
  styleUrls: ['./staff-based-used-count-reports.component.css'],
})
export class StaffBasedUsedCountReportsComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  private isReloading = false;
  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;

  tableDataSource = (params: any) => {
    const apiUrl = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CafeteriaEvents/StaffBasedSaleAndUsedCounts`;
    return this.http
      .post<GridResponse>(apiUrl, {
        page: params.page || 1,
        limit: params.limit || 100,
        offset: ((params.page || 1) - 1) * (params.limit || 100),
        search: params.search || undefined,
        searchLogic: params.searchLogic || 'AND',
        sort: params.sort,
        join: params.join,
        showDeleted: params.showDeleted,
        columns: this.tableColumns,
      })
      .pipe(
        map((response: GridResponse) => {
          const records = (response.records || []).map((r: any, i: number) => ({
            ...r,
            _recid: r._recid ?? `${r.ID ?? ''}_${r.Name ?? ''}_${i}`,
          }));
          return {
            status: 'success' as const,
            total: response.total ?? records.length,
            records,
          };
        }),
        catchError((error) => {
          console.error('Error loading staff based used count reports:', error);
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
        save: false,
      },
    };
  }

  onSave = (data: any, isEdit: boolean): Observable<any> => {
    return of({ error: true, message: 'Bu rapor sadece görüntüleme amaçlıdır.' });
  };

  onFormChange = (formData: any) => {};

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  onTableRowClick(event: any): void {}
  onTableRowDblClick(event: any): void {}
  onTableRowSelect(event: TableRow[]): void {}
  onTableRefresh(): void {
    if (!this.isReloading && this.dataTableComponent) {
      this.isReloading = true;
      setTimeout(() => {
        this.isReloading = false;
      }, 1000);
    }
  }
  onTableDelete(event: any): void {}
  onTableAdd(): void {}
  onTableEdit(event: any): void {}
  onAdvancedFilterChange(event: any): void {}
}
