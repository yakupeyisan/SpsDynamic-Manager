// FreeCard Component
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { SelectComponent } from 'src/app/components/select/select.component';

// Import configurations
import { joinOptions } from './free-card-config';
import { tableColumns } from './free-card-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './free-card-form-config';

// Import types from DataTableComponent
import { 
  DataTableComponent, 
  TableColumn, 
  ToolbarConfig, 
  GridResponse, 
  JoinOption,
  FormTab
} from 'src/app/components/data-table/data-table.component';

@Component({
  selector: 'app-free-card',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule, 
    TablerIconsModule,
    TranslateModule,
    DataTableComponent,
    FormsModule,
    ModalComponent,
    SelectComponent
  ],
  templateUrl: './free-card.component.html',
  styleUrls: ['./free-card.component.scss']
})
export class FreeCardComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  
  // Table configuration
  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;
  
  // Form configuration
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;
  
  // Data source function for table
  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${environment.apiUrl}/api/Cards/FreeCards`, {
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
        console.error('Error loading free cards:', error);
        return of({
          status: 'error' as const,
          total: 0,
          records: []
        } as GridResponse);
      })
    );
  };

  // Card assignment modal state
  showCardAssignmentModal: boolean = false;
  selectedEmployeeId: number | null = null;
  employees: any[] = [];

  // Toolbar configuration
  get tableToolbarConfig(): ToolbarConfig {
    return {
      items: [
        {
          type: 'break' as const,
          id: 'break-operations-menu'
        },
        {
          id: 'operations',
          type: 'menu' as const,
          text: 'İşlemler',
          icon: 'fa fa-cog',
          items: [
            {
              id: 'assignCard',
              text: 'Kart Ata',
              onClick: (event: MouseEvent, item: any) => this.onAssignCard(event, item)
            }
          ]
        }
      ],
      show: {
        reload: true,
        columns: true,
        search: true,
        add: true,
        edit: true,
        delete: true,
        save: false
      }
    };
  }

  // Save handler
  onSave = (data: any, isEdit: boolean) => {
    const url = `${environment.apiUrl}/api/Cards/FreeCards/save`;
    const recid = data.CardID || data.recid || null;
    const { CardID, recid: _, ...record } = data;
    
    return this.http.post(url, {
      request: {
        action: 'save',
        recid: recid,
        name: isEdit ? 'EditCard' : 'AddCard',
        record: record
      }
    }).pipe(
      map((response: any) => {
        if (response.error === false || response.status === 'success') {
          this.toastr.success(this.translate.instant('common.saveSuccess') || 'Kayıt başarıyla kaydedildi', this.translate.instant('common.success') || 'Başarılı');
          return { error: false, record: response.record || response };
        } else {
          this.toastr.error(response.message || this.translate.instant('common.saveError') || 'Kayıt kaydedilemedi', this.translate.instant('common.error') || 'Hata');
          return { error: true, message: response.message || this.translate.instant('common.saveError') || 'Kayıt kaydedilemedi' };
        }
      }),
      catchError(error => {
        this.toastr.error(this.translate.instant('common.saveError') || 'Kayıt kaydedilemedi', this.translate.instant('common.error') || 'Hata');
        return of({ error: true, message: error.message || this.translate.instant('common.saveError') || 'Kayıt kaydedilemedi' });
      })
    );
  };

  // Form change handler
  onFormChange = (formData: any) => {
    // Handle form data changes if needed
  };

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load employees for card assignment
    this.loadEmployees();
  }

  /**
   * Load employees for card assignment dropdown
   */
  private loadEmployees(): void {
    this.http.post<GridResponse>(`${environment.apiUrl}/api/Employees`, {
      limit: -1,
      offset: 0,
      columns: [{ field: 'EmployeeID' }, { field: 'Name' }, { field: 'SurName' }]
    }).pipe(
      map((response: GridResponse) => {
        return (response.records || []).map((item: any) => ({
          label: `${item.Name || ''} ${item.SurName || ''}`.trim() || `ID: ${item.EmployeeID}`,
          value: item.EmployeeID
        }));
      }),
      catchError(error => {
        console.error('Error loading employees:', error);
        this.toastr.error('Personel listesi yüklenirken hata oluştu.', 'Hata');
        return of([]);
      })
    ).subscribe(employees => {
      this.employees = employees;
      this.cdr.detectChanges();
    });
  }

  /**
   * Open card assignment modal
   */
  onAssignCard(event: MouseEvent, item: any): void {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }

    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen atamak için en az bir kart seçiniz.');
      return;
    }

    // Reset selection
    this.selectedEmployeeId = null;
    this.showCardAssignmentModal = true;
  }

  /**
   * Assign selected cards to employee
   */
  onAssignCardsToEmployee(): void {
    if (!this.selectedEmployeeId) {
      this.toastr.warning('Lütfen bir personel seçiniz.', 'Uyarı');
      return;
    }

    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }

    // Get selected card IDs
    const selectedCardIds: number[] = [];
    this.dataTableComponent.selectedRows.forEach((row: any) => {
      const cardId = row.CardID || row.recid;
      if (cardId) {
        selectedCardIds.push(cardId);
      }
    });

    if (selectedCardIds.length === 0) {
      this.toastr.warning('Geçerli kart seçilmedi.');
      return;
    }

    // Assign cards to employee via API
    // Using Cards/form endpoint with EmployeeID field
    const assignPromises = selectedCardIds.map(cardId => {
      return this.http.post(`${environment.apiUrl}/api/Cards/FreeCards/save`, {
        request: {
          action: 'save',
          recid: cardId,
          name: 'EditCard',
          record: {
            EmployeeID: this.selectedEmployeeId
          }
        }
      }).pipe(
        catchError(error => {
          console.error(`Error assigning card ${cardId}:`, error);
          return of({ error: true, message: error.message });
        })
      );
    });

    // Execute all assignments
    Promise.all(assignPromises.map(p => firstValueFrom(p))).then((results: any[]) => {
      const successCount = results.filter((r: any) => !r?.error).length;
      const errorCount = results.filter((r: any) => r?.error).length;

      if (successCount > 0) {
        this.toastr.success(`${successCount} kart başarıyla atandı.`, 'Başarılı');
      }
      if (errorCount > 0) {
        this.toastr.error(`${errorCount} kart atanamadı.`, 'Hata');
      }

      // Close modal and reload grid
      this.showCardAssignmentModal = false;
      this.selectedEmployeeId = null;
      if (this.dataTableComponent) {
        this.dataTableComponent.reload();
      }
    });
  }

  /**
   * Close card assignment modal
   */
  onCloseCardAssignmentModal(): void {
    this.showCardAssignmentModal = false;
    this.selectedEmployeeId = null;
  }

  // Event handlers
  onTableRowClick(event: any): void {
    // Handle row click
  }

  onTableRowDblClick(event: any): void {
    // Handle row double click
  }

  onTableRowSelect(event: any): void {
    // Handle row selection
  }

  onTableRefresh(): void {
    // Handle refresh
  }

  onTableDelete(event: any): void {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }

    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen silmek için en az bir kayıt seçiniz.');
      return;
    }

    // Get selected card IDs
    const selectedIds: number[] = [];
    selectedRows.forEach((row: any) => {
      const cardId = row.CardID || row.recid;
      if (cardId) {
        selectedIds.push(cardId);
      }
    });

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli kayıt seçilmedi.');
      return;
    }

    // Confirm deletion
    if (!confirm(`${selectedIds.length} kayıt silinecek. Emin misiniz?`)) {
      return;
    }

    // Delete via API
    this.http.post(`${environment.apiUrl}/api/Cards/FreeCards/delete`, {
      Selecteds: selectedIds
    }).subscribe({
      next: (response: any) => {
        if (response.error === false || response.status === 'success') {
          this.toastr.success(this.translate.instant('common.deleteSuccess') || 'Kayıt(lar) başarıyla silindi', this.translate.instant('common.success') || 'Başarılı');
          // Reload grid
          if (this.dataTableComponent) {
            this.dataTableComponent.reload();
          }
        } else {
          this.toastr.error(response.message || this.translate.instant('common.deleteError') || 'Kayıt(lar) silinemedi', this.translate.instant('common.error') || 'Hata');
        }
      },
      error: (error) => {
        console.error('Error deleting cards:', error);
        const errorMessage = error.error?.message || error.message || this.translate.instant('common.deleteError') || 'Kayıt(lar) silinemedi';
        this.toastr.error(errorMessage, this.translate.instant('common.error') || 'Hata');
      }
    });
  }

  onTableAdd(): void {
    // Add is handled by DataTableComponent, no custom logic needed
  }

  onTableEdit(event: any): void {
    // Edit is handled by DataTableComponent, no custom logic needed
  }

  onAdvancedFilterChange(event: any): void {
    // Handle advanced filter change
  }
}
