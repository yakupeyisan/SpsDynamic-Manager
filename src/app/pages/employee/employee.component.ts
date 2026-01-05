// Employee Component - Adapted from old app.component.ts
// NOTE: This component requires DataTableComponent to be created
// The component structure is ready but DataTableComponent needs to be implemented

import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, finalize } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Import configurations
import { joinOptions } from './employee-config';
import { tableColumns } from './employee-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper, imageUploadUrl, imageField, imagePreviewUrl } from './employee-form-config';
import { getGridColumns } from './employee-nested-grids';

// Import types from DataTableComponent
import { 
  DataTableComponent, 
  TableColumn, 
  ToolbarConfig, 
  GridResponse, 
  JoinOption,
  FormTab,
  FormTabGrid,
  ColumnType
} from 'src/app/components/data-table/data-table.component';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule, 
    TablerIconsModule,
    TranslateModule,
    DataTableComponent
  ],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {
  // Table configuration
  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;
  
  // Form configuration
  formFields: TableColumn[] = formFields;
  formTabs = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;
  imageUploadUrl = imageUploadUrl;
  imageField = imageField;
  imagePreviewUrl = imagePreviewUrl;
  
  // Data source function for table
  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${environment.apiUrl}/api/Employees`, {
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
        console.error('Error loading employees:', error);
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
          type: 'break' as const,
          id: 'break-operations-menu'
        },
        {
          id: 'operations-menu',
          type: 'menu' as const,
          text: this.translate.instant('toolbar.operations'),
          tooltip: this.translate.instant('toolbar.operationsTooltip'),
          items: [
            {
              id: 'bulk-access-permission',
              text: this.translate.instant('operations.bulkAccessPermission'),
              onClick: (event: MouseEvent, item: any) => this.onBulkAccessPermission(event, item)
            },
            {
              id: 'bulk-company',
              text: this.translate.instant('operations.bulkCompany'),
              onClick: (event: MouseEvent, item: any) => this.onBulkCompany(event, item)
            },
            {
              id: 'bulk-position',
              text: this.translate.instant('operations.bulkPosition'),
              onClick: (event: MouseEvent, item: any) => this.onBulkPosition(event, item)
            },
            {
              id: 'bulk-department',
              text: this.translate.instant('operations.bulkDepartment'),
              onClick: (event: MouseEvent, item: any) => this.onBulkDepartment(event, item)
            },
            {
              id: 'bulk-sms',
              text: this.translate.instant('operations.bulkSms'),
              onClick: (event: MouseEvent, item: any) => this.onBulkSms(event, item)
            },
            {
              id: 'bulk-mail',
              text: this.translate.instant('operations.bulkMail'),
              onClick: (event: MouseEvent, item: any) => this.onBulkMail(event, item)
            },
            {
              id: 'import-from-excel',
              text: this.translate.instant('operations.importFromExcel'),
              onClick: (event: MouseEvent, item: any) => this.onImportFromExcel(event, item)
            },
            {
              id: 'bulk-image-upload',
              text: this.translate.instant('operations.bulkImageUpload'),
              onClick: (event: MouseEvent, item: any) => this.onBulkImageUpload(event, item)
            },
            {
              id: 'bulk-web-client',
              text: this.translate.instant('operations.bulkWebClient'),
              onClick: (event: MouseEvent, item: any) => this.onBulkWebClient(event, item)
            },
            {
              id: 'bulk-password-reset',
              text: this.translate.instant('operations.bulkPasswordReset'),
              onClick: (event: MouseEvent, item: any) => this.onBulkPasswordReset(event, item)
            },
            {
              id: 'export-to-excel',
              text: this.translate.instant('operations.exportToExcel'),
              onClick: (event: MouseEvent, item: any) => this.onExportToExcel(event, item)
            }
          ]
        }
      ],
      show: {
        reload: true,
        add: true,
        edit: true,
        delete: true,
        save: false
      }
    };
  }

  // Get grid columns function
  getGridColumns = getGridColumns;

  // Get grid dataSource function
  getGridDataSource = (gridId: string, formData: any): ((params: any) => Observable<GridResponse>) | undefined => {
    switch (gridId) {
      case 'EmployeeCardGrid':
        return (params: any) => {
          const requestBody = params;
          
          return this.http.post<GridResponse>(`${environment.apiUrl}/api/Cards/GetCardsByEmployeeID`, requestBody).pipe(
            map((response: GridResponse) => ({
              status: 'success' as const,
              total: response.total || (response.records ? response.records.length : 0),
              records: response.records || []
            })),
            catchError(error => {
              console.error('Error loading cards:', error);
              return of({
                status: 'error' as const,
                total: 0,
                records: []
              } as GridResponse);
            })
          );
        };
      case 'EmployeeAccessGroupReaders':
        return (params: any) => {
          const requestBody = params;
          
          if (params.AccessGroups && Array.isArray(params.AccessGroups) && params.AccessGroups.length > 0) {
            requestBody.AccessGroups = params.AccessGroups;
          }
          
          console.log('EmployeeAccessGroupReaders API request:', requestBody);
          
          return this.http.post<GridResponse>(`${environment.apiUrl}/api/AccessGroupReaders/GetReadersByAccessGroups`, requestBody).pipe(
            map((response: GridResponse) => ({
              status: 'success' as const,
              total: response.total || (response.records ? response.records.length : 0),
              records: response.records || []
            })),
            catchError(error => {
              console.error('Error loading access group readers:', error);
              return of({
                status: 'error' as const,
                total: 0,
                records: []
              } as GridResponse);
            })
          );
        };
      case 'EmployeeHistories':
        return (params: any) => {
          const requestBody = params;
          console.log('EmployeeHistories API request:', requestBody);
          
          return this.http.post<GridResponse>(`${environment.apiUrl}/api/PdksCompanyHistories/EmployeeHistories`, requestBody).pipe(
            map((response: GridResponse) => ({
              status: 'success' as const,
              total: response.total || (response.records ? response.records.length : 0),
              records: response.records || []
            })),
            catchError(error => {
              console.error('Error loading employee histories:', error);
              return of({
                status: 'error' as const,
                total: 0,
                records: []
              } as GridResponse);
            })
          );
        };
      case 'SubscriptionEvents':
        return (params: any) => {
          const requestBody = params;
          
          return this.http.post<GridResponse>(`${environment.apiUrl}/api/SubscriptionEvents/GetAllByCardTagCode`, requestBody).pipe(
            map((response: GridResponse) => ({
              status: 'success' as const,
              total: response.total || (response.records ? response.records.length : 0),
              records: response.records || []
            })),
            catchError(error => {
              console.error('Error loading subscription events:', error);
              return of({
                status: 'error' as const,
                total: 0,
                records: []
              } as GridResponse);
            })
          );
        };
      default:
        return undefined;
    }
  };

  // Save callback
  onSave = (data: any, isEdit: boolean): Observable<any> => {
    const url = `${environment.apiUrl}/api/Employees/form`;
    const recid = data.EmployeeID || data.recid || null;
    const { EmployeeID, recid: _, ...record } = data;
    return this.http.post(url, {
      request: {
        action: 'save',
        recid: recid,
        name: 'EditEmployee',
        record: record
      }
    });
  };

  // Form change handler
  private previousAccessGroup: any = null;
  private previousSubscriptionCard: any = null;
  private previousCafeteriaAccount: any = null;

  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;

  onFormChange = (formData: any) => {
    console.log('onFormChange called with formData:', formData);
    
    if (formData) {
      const currentAccessGroup = formData['AccessGroup'];
      
      if (formData.hasOwnProperty('AccessGroup')) {
        const previousStr = JSON.stringify(this.previousAccessGroup);
        const currentStr = JSON.stringify(currentAccessGroup);
        
        if (previousStr !== currentStr) {
          console.log('AccessGroup changed:', {
            previous: this.previousAccessGroup,
            current: currentAccessGroup
          });
          this.previousAccessGroup = currentAccessGroup;
          this.reloadNestedGrid('EmployeeAccessGroupReaders');
        }
      }
      
      if (formData.hasOwnProperty('SubscriptionCard')) {
        const currentSubscriptionCard = formData['SubscriptionCard'];
        const previousSubscriptionCard = this.previousSubscriptionCard;
        
        if (previousSubscriptionCard !== currentSubscriptionCard) {
          console.log('SubscriptionCard changed:', {
            previous: previousSubscriptionCard,
            current: currentSubscriptionCard
          });
          this.previousSubscriptionCard = currentSubscriptionCard;
          this.reloadNestedGrid('SubscriptionEvents');
        }
      }

      if (formData.hasOwnProperty('CafeteriaAccount')) {
        const currentCafeteriaAccount = formData['CafeteriaAccount'];
        if (this.previousCafeteriaAccount !== currentCafeteriaAccount && currentCafeteriaAccount != null) {
          console.log('CafeteriaAccount changed:', {
            previous: this.previousCafeteriaAccount,
            current: currentCafeteriaAccount
          });
          this.previousCafeteriaAccount = currentCafeteriaAccount;
          this.loadTotalPrice(currentCafeteriaAccount);
        }
      }
    }
  };

  // Event handlers
  onTableRowClick(event: { row: any; columnIndex?: number }) {
    console.log('Row clicked:', event.row);
  }

  onPictureClick(event: { row: any; column: any; rowIndex: number; columnIndex: number; pictureId: string; event: MouseEvent }) {
    console.log('Picture clicked:', event);
  }

  onTableRowSelect(rows: any[]) {
    console.log('Rows selected:', rows);
  }

  onAdvancedFilterChange(filter: any) {
    console.log('Advanced filter changed:', filter);
  }

  onTableRefresh() {
    console.log('Table refresh requested');
  }

  onTableDelete(rows: any[]) {
    console.log('Delete records requested:', rows);
  }
  
  onTableAdd() {
    console.log('Add new record requested');
  }
  
  onTableEdit(row: any) {
    console.log('Edit record requested:', row);
  }
  
  onTableRowDblClick(row: any) {
    console.log('Row double-clicked:', row);
  }
  
  onTableContextMenu(event: { row: any; event: MouseEvent }) {
    event.event.preventDefault();
  }
  
  onTableColumnClick(event: { column: TableColumn; event: MouseEvent }) {
    console.log('Column clicked:', event.column.field);
  }
  
  onTableColumnDblClick(event: { column: TableColumn; event: MouseEvent }) {
    console.log('Column double-clicked:', event.column.field);
  }
  
  onTableColumnContextMenu(event: { column: TableColumn; event: MouseEvent }) {
    event.event.preventDefault();
  }
  
  onTableColumnResize(event: { column: TableColumn; width: number }) {
    console.log('Column resized:', event.column.field, 'new width:', event.width);
  }
  
  onTableMouseEnter(row: any) {
    // Could show tooltip or highlight
  }
  
  onTableMouseLeave(row: any) {
    // Remove tooltip or highlight
  }
  
  onTableFocus() {
    console.log('Table focused');
  }
  
  onTableBlur() {
    // Table blurred
  }
  
  onTableCopy(event: { text: string; event: ClipboardEvent }) {
    console.log('Copy event:', event.text);
  }
  
  onTablePaste(event: { text: string; event: ClipboardEvent }) {
    console.log('Paste event:', event.text);
  }

  // Bulk operation handlers
  onBulkAccessPermission(event: MouseEvent, item: any) {
    console.log('Bulk access permission:', event, item);
  }

  onBulkCompany(event: MouseEvent, item: any) {
    console.log('Bulk company:', event, item);
  }

  onBulkPosition(event: MouseEvent, item: any) {
    console.log('Bulk position:', event, item);
  }

  onBulkDepartment(event: MouseEvent, item: any) {
    console.log('Bulk department:', event, item);
  }

  onBulkSms(event: MouseEvent, item: any) {
    console.log('Bulk SMS:', event, item);
  }

  onBulkMail(event: MouseEvent, item: any) {
    console.log('Bulk mail:', event, item);
  }

  onImportFromExcel(event: MouseEvent, item: any) {
    console.log('Import from Excel:', event, item);
  }

  onBulkImageUpload(event: MouseEvent, item: any) {
    console.log('Bulk image upload:', event, item);
  }

  onBulkWebClient(event: MouseEvent, item: any) {
    console.log('Bulk web client:', event, item);
  }

  onBulkPasswordReset(event: MouseEvent, item: any) {
    console.log('Bulk password reset:', event, item);
  }

  onExportToExcel(event: MouseEvent, item: any) {
    console.log('Export to Excel:', event, item);
  }

  /**
   * Reload a nested grid by ID in the main data table
   */
  reloadNestedGrid(gridId: string): void {
    if (this.dataTableComponent) {
      setTimeout(() => {
        if (this.dataTableComponent?.nestedGrids) {
          const grid = this.dataTableComponent.nestedGrids.find((g: any) => g.id === gridId);
          if (grid && grid.dataSource) {
            grid.reload();
          }
        }
      }, 0);
    }
  }

  /**
   * Load total price based on CafeteriaAccount and EmployeeID
   */
  loadTotalPrice(accountId: number): void {
    if (!this.dataTableComponent) {
      return;
    }

    // Get EmployeeID from formData
    const employeeId = this.dataTableComponent.formData['EmployeeID'] || 
                      this.dataTableComponent.formData['recid'] ||
                      this.dataTableComponent.editingRecordId;

    if (!employeeId) {
      console.warn('EmployeeID not found, cannot load total price');
      return;
    }

    const url = `${environment.apiUrl}/api/CafeteriaEvents/GetTotalBalanceWithAccountIdAndEmployeeId`;
    const payload = {
      EmployeeID: employeeId,
      AccountId: accountId
    };
    
    console.log('Loading total price from:', url, 'with payload:', payload);

    this.http.post<any>(url, payload).pipe(
      finalize(() => {
        // Handle finalization if needed
      })
    ).subscribe({
      next: (response) => {
        console.log('Total price response:', response);
        if (response && response.status === 'success' && response.totalBalance != null) {
          // Update formData with totalBalance using onFormDataChange to trigger change detection
          if (this.dataTableComponent) {
            this.dataTableComponent.onFormDataChange({ TotalPrice: response.totalBalance });
            // Force change detection to update the view after form data change
            this.cdr.detectChanges();
          }
        } else {
          console.warn('Invalid response structure or status:', response);
        }
      },
      error: (error) => {
        console.error('Error loading total price:', error);
      }
    });
  }

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Component initialized
  }
}
