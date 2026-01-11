// InputOutputReports Component
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
import { joinOptions } from './input-output-reports-config';
import { tableColumns } from './input-output-reports-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './input-output-reports-form-config';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, JoinOption, FormTab, TableRow } from 'src/app/components/data-table/data-table.component';

@Component({
  selector: 'app-input-output-reports',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule, DataTableComponent],
  templateUrl: './input-output-reports.component.html',
  styleUrls: ['./input-output-reports.component.scss']
})
export class InputOutputReportsComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  private isReloading: boolean = false;
  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;
  
  tableDataSource = (params: any) => {
    return this.http.post<any>(`${environment.apiUrl}/api/AccessEvents/InputOutputReports`, {
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
      map((response: any) => {
        // Handle response - API returns flattened records (each record has EventID and nested Employee)
        let records: any[] = [];
        let total = 0;

        if (response.records) {
          // GridResponse format: { records: [...], total: ... }
          records = response.records.map((record: any) => ({
            ...record,
            recid: record.EventID || record.recid || `${record.EmployeeID || ''}_${record.Date || ''}_${record.inOUT || ''}`
          }));
          total = response.total || records.length;
        } else if (Array.isArray(response)) {
          // Direct array format: [...]
          records = response.map((record: any) => ({
            ...record,
            recid: record.EventID || record.recid || `${record.EmployeeID || ''}_${record.Date || ''}_${record.inOUT || ''}`
          }));
          total = records.length;
        }

        return {
          status: 'success' as const,
          total: total,
          records: records
        } as GridResponse;
      }),
      catchError(error => {
        console.error('Error loading input/output reports:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  get tableToolbarConfig(): ToolbarConfig {
    return { 
      items: [], 
      show: { reload: true, columns: true, search: true, add: false, edit: false, delete: false, save: false } 
    };
  }

  onSave = (data: any, isEdit: boolean): Observable<any> => {
    return of({ error: true, message: 'İlk Giriş/Son Çıkış raporu sadece görüntüleme amaçlıdır.' });
  };

  onFormChange = (formData: any) => {};

  constructor(private http: HttpClient, private toastr: ToastrService, public translate: TranslateService, private cdr: ChangeDetectorRef) {}
  
  ngOnInit(): void {}

  onTableRowClick(event: any): void {}
  onTableRowDblClick(event: any): void {}
  onTableRowSelect(event: TableRow[]): void {}
  onTableRefresh(): void {
    if (!this.isReloading && this.dataTableComponent) {
      this.isReloading = true;
      setTimeout(() => { this.isReloading = false; }, 1000);
    }
  }
  onTableDelete(event: any): void {}
  onTableAdd(): void {}
  onTableEdit(event: any): void {}
  onAdvancedFilterChange(event: any): void {}
}
