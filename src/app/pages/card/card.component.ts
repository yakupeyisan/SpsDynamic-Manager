// Card Component
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

// Import configurations
import { joinOptions } from './card-config';
import { tableColumns } from './card-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './card-form-config';

// Import types from DataTableComponent
import { 
  DataTableComponent, 
  TableColumn, 
  ToolbarConfig, 
  GridResponse, 
  JoinOption,
  FormTab
} from 'src/app/components/data-table/data-table.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { SelectComponent } from 'src/app/components/select/select.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule, 
    FormsModule,
    TablerIconsModule,
    TranslateModule,
    DataTableComponent,
    ModalComponent,
    SelectComponent
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
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
  
  // Bulk Cafeteria Group Change modal state
  showBulkCafeteriaGroupModal = false;
  selectedCardsForCafeteriaGroup: any[] = [];
  selectedCafeteriaGroupId: number | null = null;
  isUpdatingCafeteriaGroup: boolean = false;
  
  // Bulk Card Status Change modal state
  showBulkStatusModal = false;
  selectedCardsForStatus: any[] = [];
  selectedStatus: boolean | null = null;
  isUpdatingStatus: boolean = false;
  statusOptions = [
    { label: 'Aktif', value: true },
    { label: 'Pasif', value: false }
  ];
  
  // Card Write modal state
  showCardWriteModal = false;
  selectedCardsForWrite: any[] = [];
  selectedCardTemplateId: number | null = null;
  cardTemplateOptions: any[] = [];
  isLoadingCardTemplates: boolean = false;
  isWritingCards: boolean = false;
  
  // Data source function for table
  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards`, {
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
        console.error('Error loading cards:', error);
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
          id: 'break-settings-menu'
        },
        {
          id: 'settings',
          type: 'menu' as const,
          text: 'İşlemler',
          icon: 'fa fa-cog',
          items: [
            {
              id: 'changeGroup',
              text: 'Kafeterya Grubunu Degistir',
              onClick: (event: MouseEvent, item: any) => this.onChangeGroup(event, item)
            },
            {
              id: 'bulkStatus',
              text: 'Toplu Kart Durumu Değiştir',
              onClick: (event: MouseEvent, item: any) => this.onBulkStatusChange(event, item)
            },
            {
              id: 'changeStatus',
              text: 'Kullanima Kapat',
              onClick: (event: MouseEvent, item: any) => this.onChangeStatus(event, item)
            },
            {
              id: 'cardWrite',
              text: 'Yazdir',
              onClick: (event: MouseEvent, item: any) => this.onCardWrite(event, item)
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
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/form`;
    const recid = data.CardID || data.recid || null;
    const { CardID, recid: _, ...record } = data;
    
    return this.http.post(url, {
      request: {
        action: 'save',
        recid: recid,
        name: isEdit ? 'EditCard' : 'AddCard',
        record: record
      }
    });
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
    // Component initialization
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
    const rows = Array.isArray(event) ? event : [event];
    const recidField = 'CardID';
    const selectedIds: number[] = [];
    for (const row of rows) {
      const id = row[recidField] ?? row.recid ?? row.id ?? row.CardID;
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

    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/delete`;
    this.http.post(url, {
      request: {
        action: 'delete',
        recid: selectedIds.length === 1 ? selectedIds[0] : selectedIds,
        name: 'DeleteCard'
      }
    }).subscribe({
      next: (res: any) => {
        if (res && !res.error) {
          this.toastr.success(
            this.translate.instant('common.deleteSuccess') || 'Kayıt(lar) başarıyla silindi',
            this.translate.instant('common.success') || 'Başarılı'
          );
          this.dataTableComponent?.reload();
        } else {
          this.toastr.error(
            res?.message || this.translate.instant('common.deleteError') || 'Kayıt(lar) silinemedi',
            this.translate.instant('common.error') || 'Hata'
          );
        }
      },
      error: (err) => {
        console.error('Card delete error:', err);
        const errMsg = err?.error?.message || err?.message || this.translate.instant('common.deleteError') || 'Kayıt(lar) silinemedi';
        this.toastr.error(errMsg, this.translate.instant('common.error') || 'Hata');
      }
    });
  }

  onTableAdd(): void {
    // Handle add
  }

  onTableEdit(event: any): void {
    // Handle edit
  }

  onAdvancedFilterChange(event: any): void {
    // Handle advanced filter change
  }

  // Toolbar menu item handlers
  onChangeGroup(event: MouseEvent, item: any): void {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }
    
    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir kart seçiniz.');
      return;
    }
    
    // Get selected card records
    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    this.selectedCardsForCafeteriaGroup = dataSource.filter((row: any) => {
      const id = row['recid'] ?? row['CardID'] ?? row['id'];
      return selectedIds.includes(id);
    });
    
    // Reset form
    this.selectedCafeteriaGroupId = null;
    
    // Load cafeteria group options if not loaded
    this.loadCafeteriaGroupOptionsIfNeeded();
    
    // Open modal
    this.showBulkCafeteriaGroupModal = true;
  }
  
  // Bulk Cafeteria Group Modal Methods
  onBulkCafeteriaGroupModalChange(show: boolean) {
    this.showBulkCafeteriaGroupModal = show;
    if (!show) {
      this.closeBulkCafeteriaGroupModal();
    }
  }
  
  closeBulkCafeteriaGroupModal() {
    this.showBulkCafeteriaGroupModal = false;
    this.selectedCardsForCafeteriaGroup = [];
    this.selectedCafeteriaGroupId = null;
  }
  
  onConfirmBulkCafeteriaGroup() {
    if (!this.selectedCafeteriaGroupId) {
      this.toastr.warning('Lütfen bir kafeterya grubu seçiniz.');
      return;
    }
    
    if (this.selectedCardsForCafeteriaGroup.length === 0) {
      this.toastr.warning('Seçili kart bulunamadı.');
      return;
    }
    
    this.isUpdatingCafeteriaGroup = true;
    
    // Get card IDs
    const cardIds = this.selectedCardsForCafeteriaGroup.map(card => 
      card['recid'] ?? card['CardID'] ?? card['id']
    );
    
    // API call to update cafeteria groups
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/BulkUpdateCafeteriaGroup`, {
      CardIDs: cardIds,
      CafeteriaGroupID: this.selectedCafeteriaGroupId
    }).pipe(
      catchError(error => {
        this.isUpdatingCafeteriaGroup = false;
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || 'Kafeterya grubu güncelleme sırasında bir hata oluştu.';
        this.toastr.error(errorMessage);
        console.error('Error updating cafeteria groups:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isUpdatingCafeteriaGroup = false;
        this.cdr.markForCheck();
        this.toastr.success('Kafeterya grupları başarıyla güncellendi.');
        this.closeBulkCafeteriaGroupModal();
        if (this.dataTableComponent) {
          this.dataTableComponent.reload();
        }
      }
    });
  }
  
  /**
   * Load cafeteria group options if not already loaded
   */
  private loadCafeteriaGroupOptionsIfNeeded(): void {
    const cafeteriaGroupField = this.formFields.find(col => col.field === 'CafeteriaGroupID');
    if (!cafeteriaGroupField || !cafeteriaGroupField.load) {
      return;
    }
    
    // Check if options already loaded
    if (cafeteriaGroupField.options && Array.isArray(cafeteriaGroupField.options) && cafeteriaGroupField.options.length > 0) {
      return;
    }
    
    // Load options from API
    const load = cafeteriaGroupField.load;
    const url = typeof load.url === 'function' ? load.url({}) : load.url;
    const method = load.method || 'GET';
    const data = typeof load.data === 'function' ? load.data({}) : (load.data || {});
    
    let request: Observable<any>;
    if (method === 'GET') {
      request = this.http.get(url);
    } else {
      request = this.http.request(method, url, { body: data });
    }
    
    request.pipe(
      map((response: any) => {
        // Apply map function if provided
        if (load.map && typeof load.map === 'function') {
          const mapped = load.map(response);
          // Convert { id, text } format to { label, value } format
          if (Array.isArray(mapped)) {
            return mapped.map((item: any) => ({
              label: item.text || item.label || item.CafeteriaGroupName || item.Name || String(item.id || item.value),
              value: item.id || item.value || item.CafeteriaGroupID || item.Id
            }));
          }
          return mapped;
        }
        
        // Default mapping
        let records: any[] = [];
        if (response && response.records && Array.isArray(response.records)) {
          records = response.records;
        } else if (response && Array.isArray(response)) {
          records = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          records = response.data;
        }
        
        return records.map((item: any) => ({
          label: item.CafeteriaGroupName || item.Name || item.text || item.label || String(item.CafeteriaGroupID || item.Id || item.id),
          value: item.CafeteriaGroupID || item.Id || item.id || item.value
        }));
      }),
      catchError(error => {
        console.error('Error loading cafeteria group options:', error);
        return of([]);
      })
    ).subscribe(options => {
      if (cafeteriaGroupField) {
        cafeteriaGroupField.options = options;
        this.cdr.markForCheck();
      }
    });
  }
  
  /**
   * Get cafeteria group options for bulk cafeteria group change modal
   */
  getCafeteriaGroupOptions(): any[] {
    const cafeteriaGroupField = this.formFields.find(col => col.field === 'CafeteriaGroupID');
    if (cafeteriaGroupField && cafeteriaGroupField.options && Array.isArray(cafeteriaGroupField.options)) {
      return cafeteriaGroupField.options.map(opt => ({
        label: opt.label,
        value: opt.value
      }));
    }
    return [];
  }

  onBulkStatusChange(event: MouseEvent, item: any): void {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }
    
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir kart seçiniz.');
      return;
    }
    
    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    this.selectedCardsForStatus = dataSource.filter((row: any) => {
      const id = row['recid'] ?? row['CardID'] ?? row['id'];
      return selectedIds.includes(id);
    });
    
    this.selectedStatus = null;
    this.showBulkStatusModal = true;
  }
  
  onBulkStatusModalChange(show: boolean) {
    this.showBulkStatusModal = show;
    if (!show) {
      this.closeBulkStatusModal();
    }
  }
  
  closeBulkStatusModal() {
    this.showBulkStatusModal = false;
    this.selectedCardsForStatus = [];
    this.selectedStatus = null;
  }
  
  onConfirmBulkStatus() {
    if (this.selectedStatus === null || this.selectedStatus === undefined) {
      this.toastr.warning('Lütfen kart durumunu seçiniz (Aktif veya Pasif).');
      return;
    }
    
    if (this.selectedCardsForStatus.length === 0) {
      this.toastr.warning('Seçili kart bulunamadı.');
      return;
    }
    
    this.isUpdatingStatus = true;
    
    const cardIds = this.selectedCardsForStatus.map(card => 
      card['recid'] ?? card['CardID'] ?? card['id']
    );
    
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/BulkUpdateStatus`, {
      CardIDs: cardIds,
      Status: this.selectedStatus
    }).pipe(
      catchError(error => {
        this.isUpdatingStatus = false;
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || 'Kart durumu güncelleme sırasında bir hata oluştu.';
        this.toastr.error(errorMessage);
        console.error('Error updating card status:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isUpdatingStatus = false;
        this.cdr.markForCheck();
        this.toastr.success('Kart durumları başarıyla güncellendi.');
        this.closeBulkStatusModal();
        if (this.dataTableComponent) {
          this.dataTableComponent.reload();
        }
      }
    });
  }

  onChangeStatus(event: MouseEvent, item: any): void {
    // Handle change status
    //console.log('Change status:', event, item);
  }

  onGetAllCards(event: MouseEvent, item: any): void {
    // Handle get all cards
    //console.log('Get all cards:', event, item);
  }

  onGetFreeCard(event: MouseEvent, item: any): void {
    // Handle get free card
    //console.log('Get free card:', event, item);
  }

  onGetAvailableCard(event: MouseEvent, item: any): void {
    // Handle get available card
    //console.log('Get available card:', event, item);
  }

  onGetUsedAvailableCard(event: MouseEvent, item: any): void {
    // Handle get used available card
    //console.log('Get used available card:', event, item);
  }

  onSetAvailable(event: MouseEvent, item: any): void {
    // Handle set available
    //console.log('Set available:', event, item);
  }

  onFreeAvailable(event: MouseEvent, item: any): void {
    // Handle free available
    //console.log('Free available:', event, item);
  }

  onCardWrite(event: MouseEvent, item: any): void {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }
    
    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir kart seçiniz.');
      return;
    }
    
    // Get selected card records
    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    this.selectedCardsForWrite = dataSource.filter((row: any) => {
      const id = row['recid'] ?? row['CardID'] ?? row['id'];
      return selectedIds.includes(id);
    });
    
    // Reset template selection
    this.selectedCardTemplateId = null;
    
    // Load card templates if not loaded
    this.loadCardTemplateOptionsIfNeeded();
    
    // Open modal
    this.showCardWriteModal = true;
  }
  
  // Card Write Modal Methods
  onCardWriteModalChange(show: boolean) {
    this.showCardWriteModal = show;
    if (!show) {
      this.closeCardWriteModal();
    }
  }
  
  closeCardWriteModal() {
    this.showCardWriteModal = false;
    this.selectedCardsForWrite = [];
    this.selectedCardTemplateId = null;
  }
  
  onConfirmCardWrite() {
    if (this.selectedCardsForWrite.length === 0) {
      this.toastr.warning('Seçili kart bulunamadı.');
      return;
    }
    
    if (!this.selectedCardTemplateId) {
      this.toastr.warning('Lütfen bir kart şablonu seçiniz.');
      return;
    }
    
    this.isWritingCards = true;
    
    // Get card IDs
    const cardIds = this.selectedCardsForWrite.map(card => 
      card['recid'] ?? card['CardID'] ?? card['id']
    );
    
    // API call to write cards
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/Write`, {
      CardIDs: cardIds,
      TemplateId: this.selectedCardTemplateId
    }).pipe(
      catchError(error => {
        this.isWritingCards = false;
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || 'Kart yazdırma sırasında bir hata oluştu.';
        this.toastr.error(errorMessage);
        console.error('Error writing cards:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isWritingCards = false;
        this.cdr.markForCheck();
        this.toastr.success('Kartlar başarıyla yazdırıldı.');
        this.closeCardWriteModal();
        if (this.dataTableComponent) {
          this.dataTableComponent.reload();
        }
      }
    });
  }
  
  /**
   * Load card template options if not already loaded
   */
  private loadCardTemplateOptionsIfNeeded(): void {
    // If already loaded, return
    if (this.cardTemplateOptions.length > 0) {
      return;
    }
    
    // If already loading, return
    if (this.isLoadingCardTemplates) {
      return;
    }
    
    this.isLoadingCardTemplates = true;
    
    // Load card templates from API
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CardTemplates`, {
      limit: -1,
      offset: 0
    }).pipe(
      map((response: any) => {
        if (response && response.records && Array.isArray(response.records)) {
          return response.records.map((item: any) => ({
            label: item.Name || item.TemplateName || `ID: ${item.Id}`,
            value: item.Id || item.id
          }));
        } else if (Array.isArray(response)) {
          return response.map((item: any) => ({
            label: item.Name || item.TemplateName || `ID: ${item.Id}`,
            value: item.Id || item.id
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error loading card template options:', error);
        this.isLoadingCardTemplates = false;
        this.cdr.markForCheck();
        return of([]);
      })
    ).subscribe(options => {
      this.cardTemplateOptions = options;
      this.isLoadingCardTemplates = false;
      this.cdr.markForCheck();
    });
  }
  
  /**
   * Get card template options for card write modal
   */
  getCardTemplateOptions(): any[] {
    return this.cardTemplateOptions.map(opt => ({
      label: opt.label,
      value: opt.value
    }));
  }
}
