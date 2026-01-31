// AvailableCard Component
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { SelectComponent } from 'src/app/components/select/select.component';

// Import configurations
import { joinOptions } from './available-card-config';
import { tableColumns } from './available-card-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './available-card-form-config';

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
  selector: 'app-available-card',
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
  templateUrl: './available-card.component.html',
  styleUrls: ['./available-card.component.scss']
})
export class AvailableCardComponent implements OnInit {
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

  // Card assignment modal state
  showCardAssignmentModal: boolean = false;
  selectedEmployeeId: number | null = null;
  employees: any[] = [];
  employeeSearchTerm$ = new Subject<string>();
  isLoadingEmployees: boolean = false;
  selectedCardsForAssignment: any[] = []; // Selected cards to display in modal
  currentSelectedCards: any[] = []; // Store selected cards from rowSelect event
  
  // Data source function for table
  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/AvailableCards`, {
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
        console.error('Error loading available cards:', error);
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
        { type: 'break' as const, id: 'break-before-assign' },
        {
          id: 'assignCard',
          type: 'button' as const,
          text: 'Kart Ata',
          icon: 'fa fa-credit-card',
          onClick: (event: MouseEvent, item: any) => this.onAssignCard(event, item)
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
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/AvailableCards/save`;
    const recid = data.CardID || data.recid || null;
    const { CardID, recid: _, ...record } = data;

    // Validation: CardDesc is required (both add & edit)
    const cardDesc = String((record as any).CardDesc ?? '').trim();
    if (!cardDesc) {
      this.toastr.warning('Kart açıklaması zorunludur.', this.translate.instant('common.warning') || 'Uyarı');
      return of({ error: true, message: 'Kart açıklaması zorunludur.' });
    }

    return this.http.post(url, {
      request: {
        action: 'save',
        recid: recid,
        name: isEdit ? 'EditCard' : 'AddCard',
        record: record
      }
    }).pipe(
      map((response: any) => {
        if (response?.error === false || response?.status === 'success') {
          this.toastr.success(
            this.translate.instant('common.saveSuccess') || 'Kayıt başarıyla kaydedildi',
            this.translate.instant('common.success') || 'Başarılı'
          );
          return { error: false, record: response.record || response };
        } else {
          this.toastr.error(
            response?.message || this.translate.instant('common.saveError') || 'Kayıt kaydedilemedi',
            this.translate.instant('common.error') || 'Hata'
          );
          return { error: true, message: response?.message || this.translate.instant('common.saveError') || 'Kayıt kaydedilemedi' };
        }
      }),
      catchError((error) => {
        console.error('Save error:', error);
        this.toastr.error(
          this.translate.instant('common.saveError') || 'Kayıt kaydedilemedi',
          this.translate.instant('common.error') || 'Hata'
        );
        return of({ error: true, message: error?.message || this.translate.instant('common.saveError') || 'Kayıt kaydedilemedi' });
      })
    );
  };

  // Form change handler
  onFormChange = (formData: any) => {
    // In add mode, ensure CardStatusId is set to "Geçici Kart" and keep it disabled.
    // We infer add mode when CardID/recid is missing.
    const isAddMode = (formData?.CardID == null && formData?.recid == null);
    if (!isAddMode) return;

    this.applyTemporaryCardStatusDefault();
  };

  private setCardStatusDisabled(disabled: boolean): void {
    const statusField = this.formFields.find((f) => f.field === 'CardStatusId');
    if (statusField) {
      statusField.disabled = disabled;
      this.cdr.markForCheck();
    }
  }

  private findTemporaryCardStatusId(): number | null {
    const statusField = this.formFields.find((f) => f.field === 'CardStatusId');
    const options: any[] = Array.isArray((statusField as any)?.options) ? (statusField as any).options : [];
    if (!options.length) return null;

    // Options are in { label, value } shape (DataTable loads and maps them).
    const match = options.find((o: any) => {
      const label = String(o?.label ?? o?.text ?? '').toLowerCase();
      return label === 'geçici kart' || label === 'gecici kart' || label.includes('geçici') || label.includes('gecici');
    });
    const val = match?.value ?? match?.id ?? null;
    if (val == null) return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  }

  private applyTemporaryCardStatusDefault(): void {
    // Disable in add mode
    this.setCardStatusDisabled(true);

    // Try to set default once options are available
    const trySet = (attempt: number) => {
      if (!this.dataTableComponent) return;
      const dt: any = this.dataTableComponent as any;
      const current = dt?.formData?.CardStatusId;
      if (current != null && current !== '') return;

      const statusId = this.findTemporaryCardStatusId();
      if (statusId != null) {
        if (!dt.formData) dt.formData = {};
        dt.formData.CardStatusId = statusId;
        this.cdr.detectChanges();
        return;
      }

      // options might not be loaded yet; retry briefly
      if (attempt < 10) {
        setTimeout(() => trySet(attempt + 1), 150);
      }
    };

    trySet(0);
  }

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Setup employee search with debounce
    this.employeeSearchTerm$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm) => {
          if (!searchTerm || searchTerm.trim().length < 2) {
            this.employees = [];
            this.cdr.detectChanges();
            return of([]);
          }

          this.isLoadingEmployees = true;
          this.cdr.detectChanges();

          return this.http
            .post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/find`, {
              search: searchTerm.trim(),
              limit: 50,
              offset: 0,
            })
            .pipe(
              map((response: any) => {
                let records: any[] = [];
                if (response.records && Array.isArray(response.records)) {
                  records = response.records;
                } else if (response.data && Array.isArray(response.data)) {
                  records = response.data;
                } else if (Array.isArray(response)) {
                  records = response;
                }

                return records.map((item: any) => {
                  const name = item.Name || '';
                  const surname = item.SurName || '';
                  const company = item.CompanyName || '';
                  let label = `${name} ${surname}`.trim();
                  if (company) label += ` - ${company}`;
                  if (!label) label = `ID: ${item.EmployeeID}`;

                  return { label, value: item.EmployeeID };
                });
              }),
              catchError((error) => {
                console.error('Error searching employees:', error);
                this.toastr.error('Personel arama sırasında hata oluştu.', 'Hata');
                return of([]);
              })
            );
        })
      )
      .subscribe((employees) => {
        this.isLoadingEmployees = false;
        this.employees = employees;
        this.cdr.detectChanges();
      });
  }

  /**
   * Open card assignment modal
   */
  onAssignCard(_event: MouseEvent, _item: any): void {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }

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
      const sourceData = (this.dataTableComponent as any).internalData || [];
      const selectedCards = sourceData.filter((row: any) => {
        const rowId = row.CardID || row.recid;
        return selectedRowIds.has(rowId);
      });
      if (selectedCards.length > 0) selectedCard = selectedCards[0];
    }

    if (!selectedCard) {
      this.toastr.warning('Seçili kart bulunamadı.');
      return;
    }

    this.selectedCardsForAssignment = [selectedCard];
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

    const selectedCard = this.selectedCardsForAssignment[0];
    const cardId = selectedCard.CardID || selectedCard.recid;
    if (!cardId) {
      this.toastr.warning('Geçerli kart seçilmedi.');
      return;
    }

    const selectedEmployee = this.employees.find((emp) => emp.value === this.selectedEmployeeId);
    const employeeName = selectedEmployee?.label || 'Seçili Personel';
    const employeeDisplayName = employeeName.includes(' - ') ? employeeName.split(' - ')[0].trim() : employeeName;

    if (!confirm(`${employeeDisplayName} kişisine kart atanacaktır. Onaylıyor musunuz?`)) {
      return;
    }

    // Assign card to employee via API (temporary cards)
    this.http
      .post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/AvailableCards/setEmployee`, {
        EmployeeID: this.selectedEmployeeId,
        CardID: cardId,
      })
      .subscribe({
        next: (response: any) => {
          if (response?.error === false || response?.status === 'success') {
            this.toastr.success('Kart başarıyla atandı.', 'Başarılı');
            this.showCardAssignmentModal = false;
            this.selectedEmployeeId = null;
            this.selectedCardsForAssignment = [];
            this.dataTableComponent?.reload();
          } else {
            this.toastr.error(response?.message || 'Kart atanamadı.', 'Hata');
          }
        },
        error: (error) => {
          console.error('Error assigning card:', error);
          const errorMessage = error?.error?.message || error?.message || 'Kart atanamadı.';
          this.toastr.error(errorMessage, 'Hata');
        },
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
    this.currentSelectedCards = Array.isArray(event) ? event : [event];
  }

  onTableRefresh(): void {
    // Handle refresh
  }

  onTableDelete(event: any): void {
    const rows = Array.isArray(event) ? event : [event];
    const selectedIds: number[] = [];
    for (const row of rows) {
      const id = row.CardID ?? row.recid ?? row.id;
      if (id != null) selectedIds.push(Number(id));
    }
    if (selectedIds.length === 0) {
      this.toastr.warning(
        this.translate.instant('common.selectRowToDelete') || 'Lütfen silmek için en az bir satır seçiniz.',
        this.translate.instant('common.warning') || 'Uyarı'
      );
      return;
    }
    const msg = selectedIds.length === 1
      ? 'Seçili kayıt silinecek. Silmek için onaylıyor musunuz?'
      : `${selectedIds.length} kayıt silinecek. Silmek için onaylıyor musunuz?`;
    if (!window.confirm(msg)) return;

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/AvailableCards/delete`, {
      request: {
        action: 'delete',
        recid: selectedIds.length === 1 ? selectedIds[0] : selectedIds,
        name: 'DeleteCard'
      }
    }).subscribe({
      next: (response: any) => {
        if (response?.error === false || response?.status === 'success') {
          this.toastr.success(
            this.translate.instant('common.deleteSuccess') || 'Kayıt(lar) başarıyla silindi',
            this.translate.instant('common.success') || 'Başarılı'
          );
          this.dataTableComponent?.reload();
        } else {
          this.toastr.error(
            response?.message || this.translate.instant('common.deleteError') || 'Kayıt(lar) silinemedi',
            this.translate.instant('common.error') || 'Hata'
          );
        }
      },
      error: (error) => {
        console.error('Error deleting cards:', error);
        const errorMessage = error?.error?.message || error?.message || this.translate.instant('common.deleteError') || 'Kayıt(lar) silinemedi';
        this.toastr.error(errorMessage, this.translate.instant('common.error') || 'Hata');
      }
    });
  }

  onTableAdd(): void {
    // Add mode: default CardStatusId to "Geçici Kart" and disable field
    this.applyTemporaryCardStatusDefault();
  }

  onTableEdit(event: any): void {
    // Edit mode: enable CardStatusId again (only disabled by default in add)
    this.setCardStatusDisabled(false);
  }

  onAdvancedFilterChange(event: any): void {
    // Handle advanced filter change
  }
}
