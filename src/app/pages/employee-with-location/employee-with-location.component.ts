// EmployeeWithLocation Component
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
import { joinOptions } from './employee-with-location-config';
import { tableColumns } from './employee-with-location-table-columns';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, JoinOption, FormTab, TableRow } from 'src/app/components/data-table/data-table.component';

@Component({
  selector: 'app-employee-with-location',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule, DataTableComponent],
  templateUrl: './employee-with-location.component.html',
  styleUrls: ['./employee-with-location.component.scss']
})
export class EmployeeWithLocationComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  private isReloading: boolean = false;
  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;
  formFields: TableColumn[] = [];
  formTabs: FormTab[] = [];
  formLoadUrl = '';
  formLoadRequest: ((recid: any, parentFormData?: any) => any) | undefined = undefined;
  formDataMapper = (data: any) => data;
  
  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/WithLocation`, {
      page: params.page || 1,
      limit: params.limit || 100,
      offset: ((params.page || 1) - 1) * (params.limit || 100),
      search: params.search || undefined,
      searchLogic: params.searchLogic || 'AND',
      sort: params.sort,
      join: params.join || ['Company', 'Kadro', 'EmployeeDepartments', 'EmployeeLastAccessEvent'],
      showDeleted: params.showDeleted,
      columns: this.tableColumns
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading employees with location:', error);
        // Fallback: Try regular Employees endpoint if WithLocation doesn't exist
        return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees`, {
          page: params.page || 1,
          limit: params.limit || 100,
          offset: ((params.page || 1) - 1) * (params.limit || 100),
          search: params.search || undefined,
          searchLogic: params.searchLogic || 'AND',
          sort: params.sort,
          join: params.join || ['Company', 'Kadro', 'EmployeeDepartments', 'EmployeeLastAccessEvent'],
          showDeleted: params.showDeleted,
          columns: this.tableColumns
        }).pipe(
          map((response: GridResponse) => ({
            status: 'success' as const,
            total: response.total || (response.records ? response.records.length : 0),
            records: response.records || []
          })),
          catchError(error2 => {
            console.error('Error loading employees:', error2);
            return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
          })
        );
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
    return of({ error: true, message: 'Bu sayfa sadece görüntüleme amaçlıdır.' });
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
