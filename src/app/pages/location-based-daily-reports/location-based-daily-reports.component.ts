// LocationBasedDailyReports Component
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
import { joinOptions } from './location-based-daily-reports-config';
import { tableColumns } from './location-based-daily-reports-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './location-based-daily-reports-form-config';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, JoinOption, FormTab, TableRow } from 'src/app/components/data-table/data-table.component';

@Component({
  selector: 'app-location-based-daily-reports',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule, DataTableComponent],
  templateUrl: './location-based-daily-reports.component.html',
  styleUrls: ['./location-based-daily-reports.component.scss']
})
export class LocationBasedDailyReportsComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  private isReloading: boolean = false;
  private terminalsMap: Map<string, string> = new Map(); // DeviceSerial -> ReaderName mapping
  tableColumns: TableColumn[] = [...tableColumns];
  joinOptions: JoinOption[] = joinOptions;
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;
  
  tableDataSource = (params: any) => {
    // Process search conditions - API expects array format for search
    let processedSearch = params.search;
    
    // Convert search conditions to array format if needed
    if (processedSearch && processedSearch.conditions && Array.isArray(processedSearch.conditions)) {
      // API expects search as array, not object with conditions
      processedSearch = processedSearch.conditions.map((condition: any) => {
        const column = this.tableColumns.find(col => col.field === condition.field);
        if (column) {
          // Use searchField if available (for Location field, it will be DeviceSerial)
          const searchField = column.searchField || condition.field;
          
          // Map operator names to API format
          let operator = condition.operator || 'is';
          if (operator === 'equals' && searchField === 'Date') {
            operator = 'between';
          } else if (operator === 'equals') {
            operator = 'is';
          } else if (operator === 'contains') {
            operator = 'contains';
          } else if (operator === 'startsWith') {
            operator = 'begins';
          }
          
          // For Date with between operator, ensure value is array
          let value = condition.value;
          if (searchField === 'Date' && operator === 'between') {
            if (!Array.isArray(value)) {
              // If single datetime, create range
              const dateStr = String(value);
              value = [dateStr, dateStr];
            }
          }
          
          // For Location field, if searchField is DeviceSerial but condition.field is Location,
          // convert the value if it's a terminal name to DeviceSerial
          if (condition.field === 'Location' && searchField === 'DeviceSerial' && value) {
            // If value is a terminal name (ReaderName), find the corresponding DeviceSerial
            for (const [deviceSerial, readerName] of this.terminalsMap.entries()) {
              if (readerName === value || String(readerName).toLowerCase() === String(value).toLowerCase()) {
                value = deviceSerial;
                break;
              }
            }
          }
          
          const resultCondition: any = {
            field: searchField,
            operator: operator,
            value: value
          };
          
          // Add type parameter for datetime fields
          if (column.type === 'datetime' || column.type === 'date' || column.type === 'time') {
            resultCondition.type = 'date';
          }
          
          return resultCondition;
        }
        return condition;
      });
    } else if (processedSearch && !Array.isArray(processedSearch)) {
      // If search is an object but not in expected format, convert it
      processedSearch = [];
    } else if (!processedSearch) {
      processedSearch = [];
    }
    
    return this.http.post<any>(`${environment.apiUrl}/api/CafeteriaEvents/LocationBasedDailyPass`, {
      page: params.page || 1,
      limit: params.limit || 100,
      offset: ((params.page || 1) - 1) * (params.limit || 100),
      search: processedSearch
    }).pipe(
      map((response: any) => {
        if (response.status === 'success') {
          let totalValue: number;
          if (response.total !== undefined && response.total !== null) {
            totalValue = response.total;
          } else if (response.count !== undefined && response.count !== null) {
            totalValue = response.count;
          } else if (response.totalCount !== undefined && response.totalCount !== null) {
            totalValue = response.totalCount;
          } else {
            console.warn('LocationBasedDailyReports API response missing total field. Using records length as fallback. Pagination may not work correctly.');
            totalValue = response.records ? response.records.length : 0;
          }
          
          const recordsCount = response.records ? response.records.length : 0;
          const limit = params.limit || 100;
          if (totalValue === limit && recordsCount === limit) {
            console.warn(`LocationBasedDailyReports: Total (${totalValue}) equals page size (${limit}) and all records returned. This might indicate more records exist but total is incorrect.`);
          }
          
          return {
            status: 'success' as const,
            total: totalValue,
            records: response.records || []
          } as GridResponse;
        } else {
          return { status: 'error' as const, total: 0, records: [] } as GridResponse;
        }
      }),
      catchError(error => {
        console.error('Error loading location based daily reports:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load terminals to map DeviceSerial to ReaderName
    // setupLocationColumnRender will be called after terminals are loaded
    this.loadTerminals();
  }

  private loadTerminals(): void {
    this.http.post<GridResponse>(`${environment.apiUrl}/api/Terminals`, {
      limit: -1,
      offset: 0
    }).pipe(
      map((response: GridResponse) => {
        if (response.records) {
          // Create mapping: DeviceSerial (SerialNumber) -> ReaderName
          response.records.forEach((terminal: any) => {
            const deviceSerial = terminal.SerialNumber || terminal.DeviceSerial;
            const readerName = terminal.ReaderName || terminal.TerminalName || terminal.Name || deviceSerial;
            if (deviceSerial) {
              this.terminalsMap.set(deviceSerial, readerName);
            }
          });
        }
        // After terminals are loaded, setup render function and refresh table
        this.setupLocationColumnRender();
        this.cdr.detectChanges();
        if (this.dataTableComponent) {
          this.dataTableComponent.onRefresh();
        }
        return response;
      }),
      catchError(error => {
        console.error('Error loading terminals:', error);
        return of(null);
      })
    ).subscribe();
  }

  private setupLocationColumnRender(): void {
    // Find Location column and set render function
    const locationColumn = this.tableColumns.find(col => col.field === 'Location');
    if (locationColumn) {
      locationColumn.render = (record: TableRow) => {
        const deviceSerial = record['Location'] || record['DeviceSerial'];
        if (deviceSerial && this.terminalsMap.has(deviceSerial)) {
          return this.terminalsMap.get(deviceSerial) || String(deviceSerial);
        }
        // If not found in map, return the original value
        return String(deviceSerial || '');
      };
    }
  }

  onTableRowClick(event: TableRow): void {
    // Handle row click if needed
  }

  onTableRowDblClick(event: TableRow): void {
    // Handle row double click if needed
  }

  onAdvancedFilterChange(event: any): void {
    // Handle advanced filter change if needed
  }

  onTableRefresh(): void {
    if (this.dataTableComponent && !this.isReloading) {
      this.isReloading = true;
      this.dataTableComponent.onRefresh();
      setTimeout(() => {
        this.isReloading = false;
      }, 1000);
    }
  }

  onTableDelete(event: any): void {
    // Handle delete if needed (probably not for reports)
  }

  onTableAdd(): void {
    // Handle add if needed (probably not for reports)
  }

  onTableEdit(event: any): void {
    // Handle edit if needed (probably not for reports)
  }

  onSave(data: any, isEdit: boolean): Observable<any> {
    // Handle save if needed (probably not for reports)
    return of({ status: 'success' });
  }

  onFormChange(data: any): void {
    // Handle form change if needed
  }
}
