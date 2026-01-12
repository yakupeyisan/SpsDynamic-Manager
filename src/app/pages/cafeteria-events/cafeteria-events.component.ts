// CafeteriaEvents Component
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
import { joinOptions } from './cafeteria-events-config';
import { tableColumns } from './cafeteria-events-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './cafeteria-events-form-config';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, JoinOption, FormTab, TableRow, ToolbarItem } from 'src/app/components/data-table/data-table.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cafeteria-events',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule, DataTableComponent, ModalComponent, FormsModule],
  templateUrl: './cafeteria-events.component.html',
  styleUrls: ['./cafeteria-events.component.scss']
})
export class CafeteriaEventsComponent implements OnInit {
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
    
    return this.http.post<any>(`${environment.apiUrl}/api/CafeteriaEvents`, {
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
            console.warn('CafeteriaEvents API response missing total field. Using records length as fallback. Pagination may not work correctly.');
            totalValue = response.records ? response.records.length : 0;
          }
          
          // Debug logging to help identify pagination issues
          const recordsCount = response.records ? response.records.length : 0;
          const limit = params.limit || 100;
          if (totalValue === limit && recordsCount === limit) {
            console.warn(`CafeteriaEvents: Total (${totalValue}) equals page size (${limit}) and all records returned. This might indicate more records exist but total is incorrect.`);
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
        console.error('Error loading cafeteria events:', error);
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
    // Component initialization
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

  // Cancel confirmation modal
  showCancelModal: boolean = false;
  selectedEventsForCancel: any[] = [];
  cancelDescription: string = '';
  isCanceling: boolean = false;

  onCancel(): void {
    if (!this.dataTableComponent) return;
    
    const selected = Array.from(this.dataTableComponent.selectedRows);
    if (selected.length === 0) {
      this.toastr.warning('Lütfen iptal etmek için en az 1 kayıt seçiniz', 'Uyarı');
      return;
    }

    // Get selected records
    const selectedRecords = this.dataTableComponent.internalData.filter(r => 
      selected.includes(r[this.dataTableComponent!.recid || 'CafeteriaEventID'])
    );

    // Check if any record has TransactionType !== '4'
    const hasNonType4 = selectedRecords.some((record: any) => {
      const transactionType = String(record['TransactionType'] || '');
      return transactionType !== '4';
    });

    if (hasNonType4) {
      this.toastr.warning('Sadece Sonraki geçişler iptal edilebilir.', 'Uyarı');
      return;
    }

    // All records have TransactionType = 4, show confirmation modal
    this.selectedEventsForCancel = selectedRecords;
    this.cancelDescription = '';
    this.showCancelModal = true;
    this.cdr.markForCheck();
  }

  onConfirmCancel(): void {
    if (this.selectedEventsForCancel.length === 0) return;

    if (!this.cancelDescription || this.cancelDescription.trim() === '') {
      this.toastr.warning('Açıklama zorunludur', 'Uyarı');
      return;
    }

    this.isCanceling = true;
    
    // Prepare Selecteds array with all CafeteriaEventIDs
    const selecteds = this.selectedEventsForCancel.map(event => event['CafeteriaEventID']);
    
    // Send single request with Selecteds array and Description
    this.http.post<any>(`${environment.apiUrl}/api/CafeteriaEvents/Cancel`, {
      Selecteds: selecteds,
      Description: this.cancelDescription.trim()
    }).pipe(
      map((response: any) => {
        if (response.status === 'success' || response.success) {
          this.toastr.success(`${selecteds.length} işlem iptal edildi`, 'Başarılı');
          this.closeCancelModal();
          if (this.dataTableComponent) {
            this.dataTableComponent.onRefresh();
          }
        } else {
          this.toastr.error(response.message || 'İşlemler iptal edilemedi', 'Hata');
        }
        this.isCanceling = false;
        this.cdr.markForCheck();
        return response;
      }),
      catchError(error => {
        console.error('Error canceling cafeteria events:', error);
        this.toastr.error('İşlemler iptal edilirken bir hata oluştu', 'Hata');
        this.isCanceling = false;
        this.cdr.markForCheck();
        return of(null);
      })
    ).subscribe();
  }

  onCancelModalChange(show: boolean): void {
    this.showCancelModal = show;
    if (!show) {
      this.closeCancelModal();
    }
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.selectedEventsForCancel = [];
    this.cancelDescription = '';
    this.isCanceling = false;
    this.cdr.markForCheck();
  }

  onTableAdd(): void {
    // Add disabled
  }

  onTableEdit(event: any): void {
    // Edit disabled
  }

  onSave(data: any, isEdit: boolean): Observable<any> {
    // Save disabled
    return of({ status: 'success' });
  }

  onFormChange(data: any): void {
    // Handle form change if needed
  }

  get tableToolbarConfig(): ToolbarConfig {
    const items: ToolbarItem[] = [
      {
        type: 'break',
        id: 'break1'
      },
      {
        type: 'button',
        id: 'cancel',
        text: 'İptal',
        icon: 'x',
        disabled: !this.hasSelection(),
        onClick: (event: MouseEvent) => {
          this.onCancel();
        }
      }
    ];
    
    return {
      items: items,
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

  hasSelection(): boolean {
    if (!this.dataTableComponent) return false;
    const selected = Array.from(this.dataTableComponent.selectedRows);
    return selected.length > 0;
  }
}
