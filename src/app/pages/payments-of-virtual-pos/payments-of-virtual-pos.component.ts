// PaymentsOfVirtualPos Component
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
import { joinOptions } from './payments-of-virtual-pos-config';
import { tableColumns } from './payments-of-virtual-pos-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './payments-of-virtual-pos-form-config';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, JoinOption, FormTab, TableRow, ToolbarItem, ColumnType } from 'src/app/components/data-table/data-table.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';

@Component({
  selector: 'app-payments-of-virtual-pos',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule, DataTableComponent, ModalComponent],
  templateUrl: './payments-of-virtual-pos.component.html',
  styleUrls: ['./payments-of-virtual-pos.component.scss']
})
export class PaymentsOfVirtualPosComponent implements OnInit {
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
    // Process search conditions to add type parameter for date fields and handle nested fields
    let processedSearch = params.search;
    if (processedSearch && processedSearch.conditions && Array.isArray(processedSearch.conditions)) {
      processedSearch = {
        ...processedSearch,
        conditions: processedSearch.conditions.map((condition: any) => {
          // Find column to determine type and searchField
          const column = this.tableColumns.find(col => col.field === condition.field);
          if (column) {
            // Use searchField if available, otherwise use field
            const searchField = column.searchField || condition.field;
            
            // Update condition field to use searchField for nested searches
            const updatedCondition = {
              ...condition,
              field: searchField
            };
            
            // Add type parameter for date fields
            if (column.type === 'date' || column.type === 'datetime' || column.type === 'time') {
              updatedCondition.type = 'date';
            }
            
            return updatedCondition;
          }
          return condition;
        })
      };
    }
    
    return this.http.post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/PaymentOfVirtualPos`, {
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
        if (response.status === 'success') {
          // Check if total is explicitly provided (not undefined/null)
          // Also check for alternative field names (count, totalCount)
          let totalValue: number;
          if (response.total !== undefined && response.total !== null) {
            totalValue = response.total;
          } else if (response.count !== undefined && response.count !== null) {
            totalValue = response.count;
          } else if (response.totalCount !== undefined && response.totalCount !== null) {
            totalValue = response.totalCount;
          } else {
            // If total is not provided, we cannot determine pagination correctly
            // Log a warning and use records length as fallback (though this is not ideal for pagination)
            console.warn('PaymentsOfVirtualPos API response missing total field. Using records length as fallback. Pagination may not work correctly.');
            totalValue = response.records ? response.records.length : 0;
          }
          
          // Debug logging to help identify pagination issues
          const recordsCount = response.records ? response.records.length : 0;
          const limit = params.limit || 100;
          if (totalValue === limit && recordsCount === limit) {
            console.warn(`PaymentsOfVirtualPos: Total (${totalValue}) equals page size (${limit}) and all records returned. This might indicate more records exist but total is incorrect.`);
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
        console.error('Error loading payments of virtual pos:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  showPaymentLogsModal: boolean = false;
  selectedPaymentId: number | null = null;
  paymentLogs: any[] = [];
  isLoadingLogs: boolean = false;
  
  paymentLogsColumns: TableColumn[] = [
    { 
      field: 'Id', 
      label: 'ID', 
      text: 'ID',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '80px', 
      size: '80px',
      min: 20,
      searchable: 'int' as ColumnType,
      resizable: true
    },
    { 
      field: 'LogTime', 
      label: 'Kayıt Tarihi', 
      text: 'Kayıt Tarihi',
      type: 'datetime' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      min: 20,
      searchable: 'datetime' as ColumnType,
      resizable: true,
      render: (record: TableRow) => {
        if (!record['LogTime']) return '';
        const dateTime = record['LogTime'];
        if (dateTime instanceof Date || (typeof dateTime === 'string' && dateTime.length > 0)) {
          const dateObj = new Date(dateTime);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toLocaleString('tr-TR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          }
        }
        return String(dateTime || '');
      }
    },
    { 
      field: 'PaymentId', 
      label: 'Ödeme No', 
      text: 'Ödeme No',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '120px', 
      size: '120px',
      min: 20,
      searchable: 'int' as ColumnType,
      resizable: true
    },
    { 
      field: 'LogText', 
      label: 'Log', 
      text: 'Log',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '100%', 
      size: '100%',
      min: 20,
      searchable: 'text' as ColumnType,
      resizable: true,
      render: (record: TableRow) => {
        return record['LogText'] || '';
      }
    }
  ];
  
  paymentLogsDataSource = (params: any) => {
    if (!this.selectedPaymentId) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    
    return this.http.post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/PaymentLogs`, {
      page: params.page || 1,
      limit: params.limit || 1000,
      offset: ((params.page || 1) - 1) * (params.limit || 1000),
      search: {
        conditions: [
          {
            field: 'PaymentId',
            operator: '=',
            value: this.selectedPaymentId
          }
        ],
        logic: 'AND'
      }
    }).pipe(
      map((response: any) => {
        if (response.status === 'success') {
          return {
            status: 'success' as const,
            total: response.total || (response.records ? response.records.length : 0),
            records: response.records || []
          } as GridResponse;
        }
        return { status: 'error' as const, total: 0, records: [] } as GridResponse;
      }),
      catchError(error => {
        console.error('Error loading payment logs:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  get tableToolbarConfig(): ToolbarConfig {
    const items: ToolbarItem[] = [
      {
        type: 'break',
        id: 'break1'
      },
      {
        type: 'button',
        id: 'viewLog',
        text: 'Logları göster',
        icon: 'file-text',
        disabled: !this.hasSingleSelection(),
        onClick: (event: MouseEvent) => {
          this.onViewLogs();
        }
      },
      {
        type: 'button',
        id: 'checkPayment',
        text: 'Mütabakat',
        icon: 'eye',
        disabled: !this.hasSelection(),
        onClick: (event: MouseEvent) => {
          this.onCheckPayment();
        }
      }
    ];
    
    return { 
      items: items, 
      show: { reload: true, columns: true, search: true, add: false, edit: false, delete: false, save: false } 
    };
  }

  hasSingleSelection(): boolean {
    if (!this.dataTableComponent) return false;
    const selected = Array.from(this.dataTableComponent.selectedRows);
    return selected.length === 1;
  }

  hasSelection(): boolean {
    if (!this.dataTableComponent) return false;
    const selected = Array.from(this.dataTableComponent.selectedRows);
    return selected.length > 0;
  }

  onViewLogs(): void {
    if (!this.dataTableComponent) return;
    const selected = Array.from(this.dataTableComponent.selectedRows);
    if (selected.length !== 1) {
      this.toastr.warning('Lütfen 1 adet kayıt seçiniz', 'Uyarı');
      return;
    }
    
    const selectedRecord = this.dataTableComponent.internalData.find(r => r[this.dataTableComponent!.recid || 'PaymentId'] === selected[0]);
    if (selectedRecord) {
      const paymentId = selectedRecord['PaymentId'] || selected[0];
      if (paymentId != null) {
        this.selectedPaymentId = paymentId;
        this.loadPaymentLogs(paymentId);
        this.showPaymentLogsModal = true;
      }
    }
  }

  onPaymentLogsModalChange(show: boolean): void {
    this.showPaymentLogsModal = show;
    if (!show) {
      this.closePaymentLogsModal();
    }
  }

  loadPaymentLogs(paymentId: number): void {
    // Data will be loaded by paymentLogsDataSource
    this.selectedPaymentId = paymentId;
    this.cdr.markForCheck();
  }

  onCheckPayment(): void {
    if (!this.dataTableComponent) return;
    const selected = Array.from(this.dataTableComponent.selectedRows);
    if (selected.length === 0) {
      this.toastr.warning('En az 1 adet kayıt seçmelisiniz', 'Uyarı');
      return;
    }

    const selectedIds = selected.map(id => {
      const record = this.dataTableComponent!.internalData.find(r => r[this.dataTableComponent!.recid || 'PaymentId'] === id);
      return record?.['PaymentId'] || id;
    });

    this.http.post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Banks/CheckPayments`, {
      Selecteds: selectedIds
    }).pipe(
      catchError(error => {
        console.error('Error checking payments:', error);
        this.toastr.error('Mütabakat yapılırken hata oluştu', 'Hata');
        return of({ success: false, message: 'Mütabakat tamamlanamadı' });
      })
    ).subscribe(response => {
      if (response.success) {
        this.toastr.success('Mütabakat tamamlandı', 'Başarılı');
        if (this.dataTableComponent) {
          this.dataTableComponent.onRefresh();
        }
      } else {
        this.toastr.warning(response.message || 'Mütabakat tamamlanamadı', 'Uyarı');
      }
    });
  }

  closePaymentLogsModal(): void {
    this.showPaymentLogsModal = false;
    this.selectedPaymentId = null;
    this.paymentLogs = [];
    this.cdr.markForCheck();
  }

  onSave = (data: any, isEdit: boolean): Observable<any> => {
    return of({ error: true, message: 'Sanal Pos Yükleme Raporları sadece görüntüleme amaçlıdır.' });
  };

  onFormChange = (formData: any) => {};

  constructor(private http: HttpClient, private toastr: ToastrService, public translate: TranslateService, private cdr: ChangeDetectorRef) {}
  
  ngOnInit(): void {}

  onTableRowClick(event: any): void {}
  onTableRowDblClick(event: any): void {}
  onTableRowSelect(event: TableRow[]): void {
    // Update toolbar button states when selection changes
    this.cdr.markForCheck();
  }
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
