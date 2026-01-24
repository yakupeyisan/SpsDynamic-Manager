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
import { tableColumns, columnGroups } from './input-output-reports-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './input-output-reports-form-config';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, JoinOption, FormTab, TableRow, TableColumnGroup } from 'src/app/components/data-table/data-table.component';

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
  columnGroups: TableColumnGroup[] = columnGroups;
  joinOptions: JoinOption[] = joinOptions;
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;
  
  tableDataSource = (params: any) => {
    // Process search conditions to add type parameter for date fields
    let processedSearch = params.search;
    if (processedSearch && processedSearch.conditions && Array.isArray(processedSearch.conditions)) {
      processedSearch = {
        ...processedSearch,
        conditions: processedSearch.conditions.map((condition: any) => {
          // Find column to determine type
          const column = this.tableColumns.find(col => col.field === condition.field);
          if (column && (column.type === 'date' || column.type === 'datetime' || column.type === 'time')) {
            // Add type parameter for date fields
            return {
              ...condition,
              type: 'date'
            };
          }
          return condition;
        })
      };
    }
    
    return this.http.post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/AccessEvents/InputOutputReports`, {
      page: params.page || 1,
      limit: params.limit || 100,
      offset: ((params.page || 1) - 1) * (params.limit || 100),
      search: processedSearch || undefined,
      searchLogic: params.searchLogic || 'AND',
      sort: params.sort,
      join: params.join,
      showDeleted: params.showDeleted,
      columns: this.tableColumns
    }).pipe(      
      map((response: any) => {
        if(response.status === 'success') {
          var employees = response.employees || [];
          var events = response.events || [];
          var records: TableRow[] = [];
          
          response.records.forEach((record: any) => {
            // Filter events for this employee and date
            const employeeEvents = events.filter((event: any) => 
              event.EmployeeID === record.EmployeeID && event.Date === record.Date
            );
            
            // Get inOUT value (check both inOUT and inOut for case sensitivity)
            const getInOut = (event: any) => {
              return event.inOUT !== undefined ? event.inOUT : (event.inOut !== undefined ? event.inOut : null);
            };
            
            // Filter InEvent (Giriş - inOUT === 0 or "0")
            const inEvents = employeeEvents.filter((event: any) => {
              const inOut = getInOut(event);
              return inOut === 0 || inOut === '0' || inOut === false || inOut === 'Giriş' || String(inOut).toLowerCase() === 'giriş';
            });
            
            // Filter OutEvent (Çıkış - inOUT === 1 or "1")
            const outEvents = employeeEvents.filter((event: any) => {
              const inOut = getInOut(event);
              return inOut === 1 || inOut === '1' || inOut === true || inOut === 'Çıkış' || String(inOut).toLowerCase() === 'çıkış';
            });
            
            var rec = {
              ...record,
              Employee: employees.find((employee: any) => employee.EmployeeID === record.EmployeeID),
              InEvent: inEvents,
              OutEvent: outEvents,
            } as TableRow;
            records.push(rec);
          });
          
          console.log('Records:', records);
          return {
            status: 'success' as const,
            total: records.length,
            records: records
          } as GridResponse;
        } else {
          return { status: 'error' as const, total: 0, records: [] } as GridResponse;
        }
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
