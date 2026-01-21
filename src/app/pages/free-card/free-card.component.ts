// FreeCard Component
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of, firstValueFrom, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
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
  employeeSearchTerm$ = new Subject<string>();
  isLoadingEmployees: boolean = false;
  selectedCardsForAssignment: any[] = []; // Selected cards to display in modal
  currentSelectedCards: any[] = []; // Store selected cards from rowSelect event

  // Report save configuration
  enableReportSave: boolean = true; // Enable report save feature
  reportConfig = {
    grid: 'FreeCardGrid',
    url: `${environment.apiUrl}/api/Cards/FreeCards`
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
    // Setup employee search with debounce
    this.employeeSearchTerm$.pipe(
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(), // Only search if term changed
      switchMap(searchTerm => {
        if (!searchTerm || searchTerm.trim().length < 2) {
          // If search term is too short, return empty array
          this.employees = [];
          this.cdr.detectChanges();
          return of([]);
        }
        
        this.isLoadingEmployees = true;
        this.cdr.detectChanges();
        
        // Search employees via API
        return this.http.post<any>(`${environment.apiUrl}/api/Employees/find`, {
          search: searchTerm.trim(),
          limit: 50, // Limit results to 50
          offset: 0
        }).pipe(
          map((response: any) => {
            console.log('Employee search response:', response);
            
            // Handle different response formats
            let records: any[] = [];
            if (response.records && Array.isArray(response.records)) {
              records = response.records;
            } else if (response.data && Array.isArray(response.data)) {
              records = response.data;
            } else if (Array.isArray(response)) {
              records = response;
            }
            
            console.log('Extracted records:', records);
            
            // Map to select options format
            const mapped = records.map((item: any) => {
              const name = item.Name || '';
              const surname = item.SurName || '';
              const company = item.CompanyName || '';
              let label = `${name} ${surname}`.trim();
              if (company) {
                label += ` - ${company}`;
              }
              if (!label) {
                label = `ID: ${item.EmployeeID}`;
              }
              
              return {
                label: label,
                value: item.EmployeeID
              };
            });
            
            console.log('Mapped employees:', mapped);
            return mapped;
          }),
          catchError(error => {
            console.error('Error searching employees:', error);
            this.toastr.error('Personel arama sırasında hata oluştu.', 'Hata');
            return of([]);
          })
        );
      })
    ).subscribe(employees => {
      this.isLoadingEmployees = false;
      this.employees = employees;
      console.log('Final employees array:', this.employees);
      console.log('Employees count:', this.employees.length);
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

    // Get selected row IDs
    const selectedRowIds = this.dataTableComponent.selectedRows;
    if (selectedRowIds.size === 0) {
      this.toastr.warning('Lütfen atamak için bir kart seçiniz.');
      return;
    }

    if (selectedRowIds.size > 1) {
      this.toastr.warning('Sadece bir kart seçebilirsiniz. Lütfen tek bir kart seçiniz.');
      return;
    }

    // Use stored selected cards from rowSelect event
    let selectedCard: any = null;
    
    if (this.currentSelectedCards.length > 0) {
      selectedCard = this.currentSelectedCards[0];
    } else {
      // Fallback: Get from internalData
      const sourceData = (this.dataTableComponent as any).internalData || [];
      const selectedCards = sourceData.filter((row: any) => {
        const rowId = row.CardID || row.recid;
        return selectedRowIds.has(rowId);
      });
      if (selectedCards.length > 0) {
        selectedCard = selectedCards[0];
      }
    }

    if (!selectedCard) {
      this.toastr.warning('Seçili kart bulunamadı.');
      return;
    }

    // Store selected card for display (only one card)
    this.selectedCardsForAssignment = [selectedCard];
    
    console.log('Selected card for assignment:', this.selectedCardsForAssignment[0]);

    // Reset selection and employees list
    this.selectedEmployeeId = null;
    this.employees = [];
    this.showCardAssignmentModal = true;
  }

  /**
   * Handle employee search term change
   */
  onEmployeeSearchChange(searchTerm: string): void {
    this.employeeSearchTerm$.next(searchTerm);
  }

  /**
   * Assign selected card to employee
   */
  onAssignCardsToEmployee(): void {
    if (!this.selectedEmployeeId) {
      this.toastr.warning('Lütfen bir personel seçiniz.', 'Uyarı');
      return;
    }

    if (this.selectedCardsForAssignment.length === 0) {
      this.toastr.warning('Seçili kart bulunamadı.');
      return;
    }

    // Get selected card
    const selectedCard = this.selectedCardsForAssignment[0];
    const cardId = selectedCard.CardID || selectedCard.recid;

    if (!cardId) {
      this.toastr.warning('Geçerli kart seçilmedi.');
      return;
    }

    // Get selected employee name
    const selectedEmployee = this.employees.find(emp => emp.value === this.selectedEmployeeId);
    const employeeName = selectedEmployee?.label || 'Seçili Personel';

    // Extract Name and SurName from label (format: "Name SurName" or "Name SurName - CompanyName")
    let employeeDisplayName = employeeName;
    if (employeeName.includes(' - ')) {
      employeeDisplayName = employeeName.split(' - ')[0].trim();
    }

    // Show confirmation dialog
    if (!confirm(`${employeeDisplayName} kişisine kart atanacaktır. Onaylıyor musunuz?`)) {
      return;
    }

    // Assign card to employee via API
    this.http.post(`${environment.apiUrl}/api/Cards/FreeCards/setEmployee`, {
      EmployeeID: this.selectedEmployeeId,
      CardID: cardId
    }).subscribe({
      next: (response: any) => {
        if (response.error === false || response.status === 'success') {
          this.toastr.success('Kart başarıyla atandı.', 'Başarılı');
          
          // Close modal and reload grid
          this.showCardAssignmentModal = false;
          this.selectedEmployeeId = null;
          this.selectedCardsForAssignment = [];
          if (this.dataTableComponent) {
            this.dataTableComponent.reload();
          }
        } else {
          this.toastr.error(response.message || 'Kart atanamadı.', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error assigning card:', error);
        const errorMessage = error.error?.message || error.message || 'Kart atanamadı.';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  /**
   * Close card assignment modal
   */
  onCloseCardAssignmentModal(): void {
    this.showCardAssignmentModal = false;
    this.selectedEmployeeId = null;
    this.selectedCardsForAssignment = [];
  }

  /**
   * Get card type name from card record
   */
  getCardTypeName(card: any): string {
    return card.CardType?.CardType || card.CardType?.CardTypeName || card.CardType?.Name || card.CardTypeName || '-';
  }

  /**
   * Get card status name from card record
   */
  getCardStatusName(card: any): string {
    return card.CardStatus?.Name || card.CardStatusName || '-';
  }

  // Event handlers
  onTableRowClick(event: any): void {
    // Handle row click
  }

  onTableRowDblClick(event: any): void {
    // Handle row double click
  }

  onTableRowSelect(event: any): void {
    // Store selected rows from event (event is array of selected row objects)
    this.currentSelectedCards = Array.isArray(event) ? event : [event];
    console.log('Row select event:', event);
    console.log('Current selected cards:', this.currentSelectedCards);
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
