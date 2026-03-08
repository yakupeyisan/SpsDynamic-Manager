// SubscriptionPackages Component
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
import { ModalComponent } from 'src/app/components/modal/modal.component';

// Import configurations
import { joinOptions } from './subscription-packages-config';
import { tableColumns } from './subscription-packages-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './subscription-packages-form-config';

// Import types from DataTableComponent
import { 
  DataTableComponent, 
  TableColumn, 
  ToolbarConfig, 
  GridResponse, 
  JoinOption,
  FormTab,
  ColumnType
} from 'src/app/components/data-table/data-table.component';

@Component({
  selector: 'app-subscription-packages',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule, 
    TablerIconsModule,
    TranslateModule,
    DataTableComponent,
    ModalComponent
  ],
  templateUrl: './subscription-packages.component.html',
  styleUrls: ['./subscription-packages.component.scss']
})
export class SubscriptionPackagesComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  @ViewChild('selectedCafeteriaGroupsTable') selectedCafeteriaGroupsTable?: DataTableComponent;
  @ViewChild('unselectedCafeteriaGroupsTable') unselectedCafeteriaGroupsTable?: DataTableComponent;

  private isReloading: boolean = false;

  // Kafeterya Grup Ayarları modal state
  showCafeteriaGroupsModal = false;
  subscriptionPackageIdForCafeteriaGroups: number | null = null;
  gridHeight = '500px';
  selectedUnselectedCafeteriaGroups: any[] = [];
  selectedSelectedCafeteriaGroups: any[] = [];

  // Cafeteria groups table columns for transfer grids
  cafeteriaGroupsTableColumns: TableColumn[] = [
    { field: 'CafeteriaGroupID', label: 'ID', text: 'ID', type: 'int' as ColumnType, sortable: true, width: '80px', size: '80px', searchable: 'int', resizable: true },
    { field: 'CafeteriaGroupName', label: 'Kafeterya Grup Adı', text: 'Kafeterya Grup Adı', type: 'text' as ColumnType, sortable: true, width: '300px', size: '300px', searchable: 'text', resizable: true },
    { field: 'Name', label: 'Ad', text: 'Ad', type: 'text' as ColumnType, sortable: true, width: '200px', size: '200px', searchable: 'text', resizable: true }
  ];

  cafeteriaGroupsTableToolbarConfig: ToolbarConfig = {
    items: [],
    show: { reload: true, columns: false, search: true, add: false, edit: false, delete: false, save: false }
  };

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
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/SubscriptionPackages`, {
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
        console.error('Error loading subscription packages:', error);
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
        { type: 'break' as const, id: 'break-cafeteria-groups' },
        { type: 'button' as const, id: 'cafeteriaGroups', text: 'Kafeterya Grup Ayarları', icon: 'fa fa-bookmark', onClick: (e: MouseEvent) => this.onEditCafeteriaGroups(e) }
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
  onSave = (data: any, isEdit: boolean): Observable<any> => {
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/SubscriptionPackages/form`;
    const recid = data.Id || data.recid || null;
    const { Id, recid: _, ...record } = data;
    // Form Tutar TL; API kuruş bekliyorsa *100
    if (record.Amount != null && record.Amount !== '') {
      const n = typeof record.Amount === 'string' ? parseFloat(record.Amount) : Number(record.Amount);
      record.Amount = Number.isNaN(n) ? 0 : Math.round(n * 100);
    }
    return this.http.post(url, {
      request: {
        action: 'save',
        recid: recid,
        name: isEdit ? 'EditSubscriptionPackage' : 'AddSubscriptionPackage',
        record: record
      }
    }).pipe(
      map((response: any) => {
        if (response.error === false || response.status === 'success') {
          this.toastr.success(this.translate.instant('common.saveSuccess'), this.translate.instant('common.success'));
          return { error: false, record: response.record || response };
        } else {
          this.toastr.error(response.message || this.translate.instant('common.saveError'), this.translate.instant('common.error'));
          return { error: true, message: response.message || this.translate.instant('common.saveError') };
        }
      }),
      catchError(error => {
        this.toastr.error(this.translate.instant('common.saveError'), this.translate.instant('common.error'));
        return of({ error: true, message: error.message || this.translate.instant('common.saveError') });
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
    if (!this.isReloading && this.dataTableComponent) {
      this.isReloading = true;
      setTimeout(() => {
        this.isReloading = false;
      }, 1000);
    }
  }

  onTableDelete(event: any): void {
    if (!event || (Array.isArray(event) && event.length === 0)) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }

    const selectedIds: number[] = [];
    const rows = Array.isArray(event) ? event : [event];
    
    rows.forEach((row: any) => {
      const id = row.Id || row.recid || row.id;
      if (id !== null && id !== undefined) {
        selectedIds.push(Number(id));
      }
    });

    if (selectedIds.length === 0) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }

    const msg = selectedIds.length === 1
      ? 'Seçili kayıt silinecek. Silmek için onaylıyor musunuz?'
      : `${selectedIds.length} kayıt silinecek. Silmek için onaylıyor musunuz?`;
    if (!window.confirm(msg)) return;

    // Call delete API
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/SubscriptionPackages/delete`, {
      request: {
        action: 'delete',
        recid: selectedIds
      }
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.toastr.success(this.translate.instant('common.deleteSuccess'), this.translate.instant('common.success'));
          if (!this.isReloading && this.dataTableComponent) {
            this.isReloading = true;
            setTimeout(() => {
              if (this.dataTableComponent) {
                this.dataTableComponent.reload();
                setTimeout(() => {
                  this.isReloading = false;
                }, 500);
              } else {
                this.isReloading = false;
              }
            }, 100);
          }
        } else {
          this.toastr.error(response.message || this.translate.instant('common.deleteError'), this.translate.instant('common.error'));
        }
      },
      error: (error) => {
        console.error('Delete error:', error);
        const errorMessage = error.error?.message || error.message || this.translate.instant('common.deleteError');
        this.toastr.error(errorMessage, this.translate.instant('common.error'));
      }
    });
  }

  onTableAdd(): void {
    if (this.dataTableComponent) {
      this.dataTableComponent.openAddForm();
    }
  }

  onTableEdit(event: any): void {
    if (event && event.selectedRecord) {
      if (this.dataTableComponent) {
        this.dataTableComponent.openEditForm(event.selectedRecord);
      }
    }
  }

  onAdvancedFilterChange(event: any): void {
    // Handle advanced filter change
  }

  // --- Kafeterya Grup Ayarları (transfer grid) ---
  onEditCafeteriaGroups(_event: MouseEvent): void {
    if (!this.dataTableComponent) {
      this.toastr.warning('Tablo bileşeni bulunamadı');
      return;
    }
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen bir abonelik paketi seçiniz.');
      return;
    }
    let dataSource: any[] = [];
    if (this.dataTableComponent.internalData?.length) dataSource = this.dataTableComponent.internalData;
    else if (this.dataTableComponent.filteredData?.length) dataSource = this.dataTableComponent.filteredData;
    else if (this.dataTableComponent.data?.length) dataSource = this.dataTableComponent.data;
    if (!dataSource?.length) {
      this.toastr.warning('Veri bulunamadı. Sayfayı yenileyip tekrar deneyin.');
      return;
    }
    const selectedIds = Array.from(selectedRows);
    const selectedRow = dataSource.find((row: any) => {
      const rowId = row.recid ?? row.Id ?? row.id;
      return selectedIds.includes(rowId);
    });
    if (!selectedRow) {
      this.toastr.warning('Seçili paket bulunamadı.');
      return;
    }
    const packageId = selectedRow.Id ?? selectedRow.recid ?? selectedRow.id;
    if (packageId == null) {
      this.toastr.warning('Geçersiz paket ID.');
      return;
    }
    this.subscriptionPackageIdForCafeteriaGroups = Number(packageId);
    this.showCafeteriaGroupsModal = true;
    setTimeout(() => {
      this.selectedCafeteriaGroupsTable?.reload();
      this.unselectedCafeteriaGroupsTable?.reload();
    }, 100);
  }

  closeCafeteriaGroupsModal(): void {
    this.showCafeteriaGroupsModal = false;
    this.subscriptionPackageIdForCafeteriaGroups = null;
    this.selectedUnselectedCafeteriaGroups = [];
    this.selectedSelectedCafeteriaGroups = [];
  }

  onCafeteriaGroupsModalResize(event: { width: number; height: number }): void {
    const newHeight = event.height - 50;
    this.gridHeight = (newHeight < 600 ? 600 : newHeight) + 'px';
  }

  selectedCafeteriaGroupsDataSource = (params: any) => {
    if (!this.subscriptionPackageIdForCafeteriaGroups) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(
      `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CafeteriaGroups/GetSelectedBySubscriptionPackageId`,
      { limit: params.limit || 100, offset: params.offset || 0, SubscriptionPackageId: this.subscriptionPackageIdForCafeteriaGroups }
    ).pipe(
      map((r: GridResponse) => ({ status: 'success' as const, total: r.total ?? (r.records?.length ?? 0), records: r.records ?? [] })),
      catchError(() => of({ status: 'error' as const, total: 0, records: [] } as GridResponse))
    );
  };

  unselectedCafeteriaGroupsDataSource = (params: any) => {
    if (!this.subscriptionPackageIdForCafeteriaGroups) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(
      `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CafeteriaGroups/GetUnSelectedBySubscriptionPackageId`,
      { limit: params.limit || 100, offset: params.offset || 0, SubscriptionPackageId: this.subscriptionPackageIdForCafeteriaGroups }
    ).pipe(
      map((r: GridResponse) => ({ status: 'success' as const, total: r.total ?? (r.records?.length ?? 0), records: r.records ?? [] })),
      catchError(() => of({ status: 'error' as const, total: 0, records: [] } as GridResponse))
    );
  };

  transferCafeteriaGroupsToSelected(): void {
    if (!this.unselectedCafeteriaGroupsTable || !this.subscriptionPackageIdForCafeteriaGroups) return;
    if (!this.selectedUnselectedCafeteriaGroups?.length) {
      this.toastr.warning('Lütfen aktarılacak kafeterya grubu seçin', 'Uyarı');
      return;
    }
    const selectedIds = this.selectedUnselectedCafeteriaGroups.map((row: any) => row.CafeteriaGroupID ?? row.Id ?? row.recid ?? row.id).filter((id: any) => id != null).map(Number);
    if (!selectedIds.length) {
      this.toastr.warning('Geçerli grup seçilmedi', 'Uyarı');
      return;
    }
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    this.http.post(`${apiUrl}/api/CafeteriaGroups/AppendSubscriptionPackageId`, {
      Selecteds: selectedIds,
      SubscriptionPackageId: this.subscriptionPackageIdForCafeteriaGroups
    }).subscribe({
      next: (r: any) => {
        if (r.status === 'success' || r.error === false) {
          this.toastr.success('Kafeterya grupları eklendi', 'Başarılı');
          this.selectedUnselectedCafeteriaGroups = [];
          this.selectedCafeteriaGroupsTable?.reload();
          this.unselectedCafeteriaGroupsTable?.reload();
        } else {
          this.toastr.error(r.message || 'Eklenirken hata oluştu', 'Hata');
        }
      },
      error: (err) => this.toastr.error(err.error?.message || err.message || 'Eklenirken hata oluştu', 'Hata')
    });
  }

  transferCafeteriaGroupsToUnselected(): void {
    if (!this.selectedCafeteriaGroupsTable || !this.subscriptionPackageIdForCafeteriaGroups) return;
    if (!this.selectedSelectedCafeteriaGroups?.length) {
      this.toastr.warning('Lütfen kaldırılacak kafeterya grubu seçin', 'Uyarı');
      return;
    }
    const selectedIds = this.selectedSelectedCafeteriaGroups.map((row: any) => row.CafeteriaGroupID ?? row.Id ?? row.recid ?? row.id).filter((id: any) => id != null).map(Number);
    if (!selectedIds.length) {
      this.toastr.warning('Geçerli grup seçilmedi', 'Uyarı');
      return;
    }
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    this.http.post(`${apiUrl}/api/CafeteriaGroups/RemoveListSubscriptionPackageId`, {
      Selecteds: selectedIds,
      SubscriptionPackageId: this.subscriptionPackageIdForCafeteriaGroups
    }).subscribe({
      next: (r: any) => {
        if (r.status === 'success' || r.error === false) {
          this.toastr.success('Kafeterya grupları kaldırıldı', 'Başarılı');
          this.selectedSelectedCafeteriaGroups = [];
          this.selectedCafeteriaGroupsTable?.reload();
          this.unselectedCafeteriaGroupsTable?.reload();
        } else {
          this.toastr.error(r.message || 'Kaldırılırken hata oluştu', 'Hata');
        }
      },
      error: (err) => this.toastr.error(err.error?.message || err.message || 'Kaldırılırken hata oluştu', 'Hata')
    });
  }
}
