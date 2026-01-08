// Authorizations Component
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
import { joinOptions } from './authorizations-config';
import { tableColumns } from './authorizations-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './authorizations-form-config';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, JoinOption, FormTab, ColumnType } from 'src/app/components/data-table/data-table.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';

@Component({
  selector: 'app-authorizations',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule, DataTableComponent, ModalComponent],
  templateUrl: './authorizations.component.html',
  styleUrls: ['./authorizations.component.scss']
})
export class AuthorizationsComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  @ViewChild('selectedClaimsTable') selectedClaimsTable?: DataTableComponent;
  @ViewChild('unselectedClaimsTable') unselectedClaimsTable?: DataTableComponent;
  @ViewChild('selectedCompaniesTable') selectedCompaniesTable?: DataTableComponent;
  @ViewChild('unselectedCompaniesTable') unselectedCompaniesTable?: DataTableComponent;
  @ViewChild('selectedStaffsTable') selectedStaffsTable?: DataTableComponent;
  @ViewChild('unselectedStaffsTable') unselectedStaffsTable?: DataTableComponent;
  @ViewChild('selectedDepartmentsTable') selectedDepartmentsTable?: DataTableComponent;
  @ViewChild('unselectedDepartmentsTable') unselectedDepartmentsTable?: DataTableComponent;
  @ViewChild('selectedCardsTable') selectedCardsTable?: DataTableComponent;
  @ViewChild('unselectedCardsTable') unselectedCardsTable?: DataTableComponent;
  private isReloading: boolean = false;
  selectedAuthorization: any = null;
  showPermissionsModal: boolean = false;
  showCompanyPermissionsModal: boolean = false;
  showStaffPermissionsModal: boolean = false;
  showDepartmentPermissionsModal: boolean = false;
  showCardPermissionsModal: boolean = false;
  authorizationIdForPermissions: number | null = null;
  selectedUnselectedClaims: any[] = [];
  selectedSelectedClaims: any[] = [];
  selectedUnselectedCompanies: any[] = [];
  selectedSelectedCompanies: any[] = [];
  selectedUnselectedStaffs: any[] = [];
  selectedSelectedStaffs: any[] = [];
  selectedUnselectedDepartments: any[] = [];
  selectedSelectedDepartments: any[] = [];
  selectedUnselectedCards: any[] = [];
  selectedSelectedCards: any[] = [];
  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;
  
  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${environment.apiUrl}/api/Authorizations`, {
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
        console.error('Error loading authorizations:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  get tableToolbarConfig(): ToolbarConfig {
    return { 
      items: [
        {
          id: 'settings',
          type: 'menu',
          text: 'Ayarlar',
          icon: 'settings',
          tooltip: 'Ayarlar',
          items: [
            {
              id: 'permissions',
              text: 'Yetkiler',
              onClick: (event) => this.openSettingsModal('permissions')
            },
            {
              id: 'company-permissions',
              text: 'Firma Yetkileri',
              onClick: (event) => this.openSettingsModal('company-permissions')
            },
            {
              id: 'staff-permissions',
              text: 'Kadro Yetkileri',
              onClick: (event) => this.openSettingsModal('staff-permissions')
            },
            {
              id: 'department-permissions',
              text: 'Bölüm Yetkileri',
              onClick: (event) => this.openSettingsModal('department-permissions')
            },
            {
              id: 'card-permissions',
              text: 'Kart Yetkileri',
              onClick: (event) => this.openSettingsModal('card-permissions')
            },
            {
              id: 'access-permissions',
              text: 'Geçiş Yetkileri',
              onClick: (event) => this.openSettingsModal('access-permissions')
            },
            {
              id: 'terminal-permissions',
              text: 'Terminal Yetkileri',
              onClick: (event) => this.openSettingsModal('terminal-permissions')
            },
            {
              id: 'person-editing-settings',
              text: 'Kişi Düzenleme Ayarları',
              onClick: (event) => this.openSettingsModal('person-editing-settings')
            },
            {
              id: 'live-view-settings',
              text: 'Canlı İzleme Ayarları',
              onClick: (event) => this.openSettingsModal('live-view-settings')
            }
          ]
        }
      ], 
      show: { reload: true, columns: true, search: true, add: true, edit: true, delete: true, save: false } 
    };
  }

  openSettingsModal(settingsType: string): void {
    // Get selected authorization
    if (!this.selectedAuthorization) {
      this.toastr.warning('Lütfen bir yetki seçin', 'Uyarı');
      return;
    }

    const authorizationId = this.selectedAuthorization.Id || this.selectedAuthorization.recid;
    if (!authorizationId) {
      this.toastr.warning('Geçersiz yetki seçimi', 'Uyarı');
      return;
    }

    // Open modal based on settings type
    if (settingsType === 'permissions') {
      this.authorizationIdForPermissions = authorizationId;
      this.showPermissionsModal = true;
      // Reload tables after a short delay to ensure modal is rendered
      setTimeout(() => {
        if (this.selectedClaimsTable) {
          this.selectedClaimsTable.reload();
        }
        if (this.unselectedClaimsTable) {
          this.unselectedClaimsTable.reload();
        }
      }, 100);
    } else if (settingsType === 'company-permissions') {
      this.authorizationIdForPermissions = authorizationId;
      this.showCompanyPermissionsModal = true;
      // Reload tables after a short delay to ensure modal is rendered
      setTimeout(() => {
        if (this.selectedCompaniesTable) {
          this.selectedCompaniesTable.reload();
        }
        if (this.unselectedCompaniesTable) {
          this.unselectedCompaniesTable.reload();
        }
      }, 100);
    } else if (settingsType === 'staff-permissions') {
      this.authorizationIdForPermissions = authorizationId;
      this.showStaffPermissionsModal = true;
      // Reload tables after a short delay to ensure modal is rendered
      setTimeout(() => {
        if (this.selectedStaffsTable) {
          this.selectedStaffsTable.reload();
        }
        if (this.unselectedStaffsTable) {
          this.unselectedStaffsTable.reload();
        }
      }, 100);
    } else if (settingsType === 'department-permissions') {
      this.authorizationIdForPermissions = authorizationId;
      this.showDepartmentPermissionsModal = true;
      // Reload tables after a short delay to ensure modal is rendered
      setTimeout(() => {
        if (this.selectedDepartmentsTable) {
          this.selectedDepartmentsTable.reload();
        }
        if (this.unselectedDepartmentsTable) {
          this.unselectedDepartmentsTable.reload();
        }
      }, 100);
    } else if (settingsType === 'card-permissions') {
      this.authorizationIdForPermissions = authorizationId;
      this.showCardPermissionsModal = true;
      // Reload tables after a short delay to ensure modal is rendered
      setTimeout(() => {
        if (this.selectedCardsTable) {
          this.selectedCardsTable.reload();
        }
        if (this.unselectedCardsTable) {
          this.unselectedCardsTable.reload();
        }
      }, 100);
    } else {
      console.log(`Opening ${settingsType} modal for authorization ID: ${authorizationId}`);
      this.toastr.info(`${settingsType} ayarları açılıyor...`, 'Bilgi');
    }
  }

  closePermissionsModal(): void {
    this.showPermissionsModal = false;
    this.authorizationIdForPermissions = null;
    this.selectedUnselectedClaims = [];
    this.selectedSelectedClaims = [];
  }

  closeCompanyPermissionsModal(): void {
    this.showCompanyPermissionsModal = false;
    this.authorizationIdForPermissions = null;
    this.selectedUnselectedCompanies = [];
    this.selectedSelectedCompanies = [];
  }

  closeStaffPermissionsModal(): void {
    this.showStaffPermissionsModal = false;
    this.authorizationIdForPermissions = null;
    this.selectedUnselectedStaffs = [];
    this.selectedSelectedStaffs = [];
  }

  closeDepartmentPermissionsModal(): void {
    this.showDepartmentPermissionsModal = false;
    this.authorizationIdForPermissions = null;
    this.selectedUnselectedDepartments = [];
    this.selectedSelectedDepartments = [];
  }

  closeCardPermissionsModal(): void {
    this.showCardPermissionsModal = false;
    this.authorizationIdForPermissions = null;
    this.selectedUnselectedCards = [];
    this.selectedSelectedCards = [];
  }

  // Data source for selected claims
  selectedClaimsDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.apiUrl}/api/OperationClaims/GetSelectedByAuthorizationId`, {
      request: {
        limit: params.limit || 100,
        offset: params.offset || 0,
        AuthorizationId: this.authorizationIdForPermissions
      }
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading selected claims:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Data source for unselected claims
  unselectedClaimsDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.apiUrl}/api/OperationClaims/GetUnSelectedByAuthorizationId`, {
      request: {
        limit: params.limit || 100,
        offset: params.offset || 0,
        AuthorizationId: this.authorizationIdForPermissions
      }
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading unselected claims:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Transfer selected claims from unselected to selected
  transferToSelected(): void {
    if (!this.unselectedClaimsTable || !this.authorizationIdForPermissions) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedUnselectedClaims || this.selectedUnselectedClaims.length === 0) {
      this.toastr.warning('Lütfen aktarılacak yetki seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedUnselectedClaims.map((row: any) => {
      const id = row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli yetki seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/OperationClaims/AppendAuthorizationId`, {
      Selecteds: selectedIds,
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Yetkiler başarıyla eklendi', 'Başarılı');
          // Reload both tables
          if (this.selectedClaimsTable) {
            this.selectedClaimsTable.reload();
          }
          if (this.unselectedClaimsTable) {
            this.unselectedClaimsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Yetkiler eklenirken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error adding claims:', error);
        const errorMessage = error.error?.message || error.message || 'Yetkiler eklenirken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Transfer selected claims from selected to unselected
  transferToUnselected(): void {
    if (!this.selectedClaimsTable || !this.authorizationIdForPermissions) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedSelectedClaims || this.selectedSelectedClaims.length === 0) {
      this.toastr.warning('Lütfen kaldırılacak yetki seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedSelectedClaims.map((row: any) => {
      const id = row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli yetki seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/OperationClaims/RemoveListAuthorizationId`, {
      Selecteds: selectedIds,
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Yetkiler başarıyla kaldırıldı', 'Başarılı');
          // Clear selections
          this.selectedSelectedClaims = [];
          // Reload both tables
          if (this.selectedClaimsTable) {
            this.selectedClaimsTable.reload();
          }
          if (this.unselectedClaimsTable) {
            this.unselectedClaimsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Yetkiler kaldırılırken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error removing claims:', error);
        const errorMessage = error.error?.message || error.message || 'Yetkiler kaldırılırken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Table columns for claims
  claimsTableColumns: TableColumn[] = [
    { 
      field: 'Id', 
      label: 'ID', 
      text: 'ID',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '80px', 
      size: '80px',
      searchable: 'int',
      resizable: true
    },
    { 
      field: 'Name', 
      label: 'Adı', 
      text: 'Adı',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '300px', 
      size: '300px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'ClaimDesc', 
      label: 'Yetki Tanımı', 
      text: 'Yetki Tanımı',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '300px', 
      size: '300px',
      searchable: 'text',
      resizable: true
    }
  ];

  // Toolbar config for transfer grids (no add, edit, delete, save buttons)
  get claimsTableToolbarConfig(): ToolbarConfig {
    return {
      items: [],
      show: {
        reload: true,
        columns: false,
        search: true,
        add: false,
        edit: false,
        delete: false,
        save: false
      }
    };
  }

  // Data source for selected companies
  selectedCompaniesDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.apiUrl}/api/PdksCompanys/GetSelectedByAuthorizationId`, {
      request: {
        limit: params.limit || 100,
        offset: params.offset || 0,
        AuthorizationId: this.authorizationIdForPermissions
      }
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading selected companies:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Data source for unselected companies
  unselectedCompaniesDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.apiUrl}/api/PdksCompanys/GetUnSelectedByAuthorizationId`, {
      request: {
        limit: params.limit || 100,
        offset: params.offset || 0,
        AuthorizationId: this.authorizationIdForPermissions
      }
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading unselected companies:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Transfer selected companies from unselected to selected
  transferCompaniesToSelected(): void {
    if (!this.unselectedCompaniesTable || !this.authorizationIdForPermissions) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedUnselectedCompanies || this.selectedUnselectedCompanies.length === 0) {
      this.toastr.warning('Lütfen aktarılacak firma seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedUnselectedCompanies.map((row: any) => {
      const id = row.PdksCompanyID || row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli firma seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/PdksCompanys/AppendAuthorizationId`, {
      Selecteds: selectedIds,
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Firmalar başarıyla eklendi', 'Başarılı');
          // Clear selections
          this.selectedUnselectedCompanies = [];
          // Reload both tables
          if (this.selectedCompaniesTable) {
            this.selectedCompaniesTable.reload();
          }
          if (this.unselectedCompaniesTable) {
            this.unselectedCompaniesTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Firmalar eklenirken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error adding companies:', error);
        const errorMessage = error.error?.message || error.message || 'Firmalar eklenirken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Transfer selected companies from selected to unselected
  transferCompaniesToUnselected(): void {
    if (!this.selectedCompaniesTable || !this.authorizationIdForPermissions) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedSelectedCompanies || this.selectedSelectedCompanies.length === 0) {
      this.toastr.warning('Lütfen kaldırılacak firma seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedSelectedCompanies.map((row: any) => {
      const id = row.PdksCompanyID || row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli firma seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/PdksCompanys/RemoveListAuthorizationId`, {
      Selecteds: selectedIds,
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Firmalar başarıyla kaldırıldı', 'Başarılı');
          // Clear selections
          this.selectedSelectedCompanies = [];
          // Reload both tables
          if (this.selectedCompaniesTable) {
            this.selectedCompaniesTable.reload();
          }
          if (this.unselectedCompaniesTable) {
            this.unselectedCompaniesTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Firmalar kaldırılırken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error removing companies:', error);
        const errorMessage = error.error?.message || error.message || 'Firmalar kaldırılırken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Table columns for companies
  companiesTableColumns: TableColumn[] = [
    { 
      field: 'PdksCompanyID', 
      label: 'ID', 
      text: 'ID',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '80px', 
      size: '80px',
      searchable: 'int',
      resizable: true
    },
    { 
      field: 'PdksCompanyName', 
      label: 'Adı', 
      text: 'Adı',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '300px', 
      size: '300px',
      searchable: 'text',
      resizable: true
    }
  ];

  // Data source for selected staffs
  selectedStaffsDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.apiUrl}/api/PdksStaffs/GetSelectedByAuthorizationId`, {
      request: {
        limit: params.limit || 100,
        offset: params.offset || 0,
        AuthorizationId: this.authorizationIdForPermissions
      }
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading selected staffs:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Data source for unselected staffs
  unselectedStaffsDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.apiUrl}/api/PdksStaffs/GetUnSelectedByAuthorizationId`, {
      request: {
        limit: params.limit || 100,
        offset: params.offset || 0,
        AuthorizationId: this.authorizationIdForPermissions
      }
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading unselected staffs:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Transfer selected staffs from unselected to selected
  transferStaffsToSelected(): void {
    if (!this.unselectedStaffsTable || !this.authorizationIdForPermissions) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedUnselectedStaffs || this.selectedUnselectedStaffs.length === 0) {
      this.toastr.warning('Lütfen aktarılacak kadro seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedUnselectedStaffs.map((row: any) => {
      const id = row.ID || row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli kadro seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/PdksStaffs/AppendAuthorizationId`, {
      Selecteds: selectedIds,
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Kadrolar başarıyla eklendi', 'Başarılı');
          // Clear selections
          this.selectedUnselectedStaffs = [];
          // Reload both tables
          if (this.selectedStaffsTable) {
            this.selectedStaffsTable.reload();
          }
          if (this.unselectedStaffsTable) {
            this.unselectedStaffsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Kadrolar eklenirken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error adding staffs:', error);
        const errorMessage = error.error?.message || error.message || 'Kadrolar eklenirken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Transfer selected staffs from selected to unselected
  transferStaffsToUnselected(): void {
    if (!this.selectedStaffsTable || !this.authorizationIdForPermissions) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedSelectedStaffs || this.selectedSelectedStaffs.length === 0) {
      this.toastr.warning('Lütfen kaldırılacak kadro seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedSelectedStaffs.map((row: any) => {
      const id = row.ID || row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli kadro seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/PdksStaffs/RemoveListAuthorizationId`, {
      Selecteds: selectedIds,
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Kadrolar başarıyla kaldırıldı', 'Başarılı');
          // Clear selections
          this.selectedSelectedStaffs = [];
          // Reload both tables
          if (this.selectedStaffsTable) {
            this.selectedStaffsTable.reload();
          }
          if (this.unselectedStaffsTable) {
            this.unselectedStaffsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Kadrolar kaldırılırken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error removing staffs:', error);
        const errorMessage = error.error?.message || error.message || 'Kadrolar kaldırılırken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Table columns for staffs
  staffsTableColumns: TableColumn[] = [
    { 
      field: 'ID', 
      label: 'ID', 
      text: 'ID',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '80px', 
      size: '80px',
      searchable: 'int',
      resizable: true
    },
    { 
      field: 'Name', 
      label: 'Adı', 
      text: 'Adı',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '300px', 
      size: '300px',
      searchable: 'text',
      resizable: true
    }
  ];

  // Data source for selected departments
  selectedDepartmentsDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.apiUrl}/api/Departments/GetSelectedByAuthorizationId`, {
      request: {
        limit: params.limit || 100,
        offset: params.offset || 0,
        AuthorizationId: this.authorizationIdForPermissions
      }
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading selected departments:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Data source for unselected departments
  unselectedDepartmentsDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.apiUrl}/api/Departments/GetUnSelectedByAuthorizationId`, {
      request: {
        limit: params.limit || 100,
        offset: params.offset || 0,
        AuthorizationId: this.authorizationIdForPermissions
      }
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading unselected departments:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Transfer selected departments from unselected to selected
  transferDepartmentsToSelected(): void {
    if (!this.unselectedDepartmentsTable || !this.authorizationIdForPermissions) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedUnselectedDepartments || this.selectedUnselectedDepartments.length === 0) {
      this.toastr.warning('Lütfen aktarılacak bölüm seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedUnselectedDepartments.map((row: any) => {
      const id = row.DepartmentID || row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli bölüm seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/Departments/AppendAuthorizationId`, {
      Selecteds: selectedIds,
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Bölümler başarıyla eklendi', 'Başarılı');
          // Clear selections
          this.selectedUnselectedDepartments = [];
          // Reload both tables
          if (this.selectedDepartmentsTable) {
            this.selectedDepartmentsTable.reload();
          }
          if (this.unselectedDepartmentsTable) {
            this.unselectedDepartmentsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Bölümler eklenirken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error adding departments:', error);
        const errorMessage = error.error?.message || error.message || 'Bölümler eklenirken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Transfer selected departments from selected to unselected
  transferDepartmentsToUnselected(): void {
    if (!this.selectedDepartmentsTable || !this.authorizationIdForPermissions) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedSelectedDepartments || this.selectedSelectedDepartments.length === 0) {
      this.toastr.warning('Lütfen kaldırılacak bölüm seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedSelectedDepartments.map((row: any) => {
      const id = row.DepartmentID || row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli bölüm seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/Departments/RemoveListAuthorizationId`, {
      Selecteds: selectedIds,
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Bölümler başarıyla kaldırıldı', 'Başarılı');
          // Clear selections
          this.selectedSelectedDepartments = [];
          // Reload both tables
          if (this.selectedDepartmentsTable) {
            this.selectedDepartmentsTable.reload();
          }
          if (this.unselectedDepartmentsTable) {
            this.unselectedDepartmentsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Bölümler kaldırılırken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error removing departments:', error);
        const errorMessage = error.error?.message || error.message || 'Bölümler kaldırılırken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Table columns for departments
  departmentsTableColumns: TableColumn[] = [
    { 
      field: 'DepartmentID', 
      label: 'ID', 
      text: 'ID',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '80px', 
      size: '80px',
      searchable: 'int',
      resizable: true
    },
    { 
      field: 'DepartmentName', 
      label: 'Adı', 
      text: 'Adı',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '300px', 
      size: '300px',
      searchable: 'text',
      resizable: true
    }
  ];

  // Data source for selected cards
  selectedCardsDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.apiUrl}/api/Cards/GetSelectedByAuthorizationId`, {
      request: {
        limit: params.limit || 100,
        offset: params.offset || 0,
        AuthorizationId: this.authorizationIdForPermissions
      }
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading selected cards:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Data source for unselected cards
  unselectedCardsDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.apiUrl}/api/Cards/GetUnSelectedByAuthorizationId`, {
      request: {
        limit: params.limit || 100,
        offset: params.offset || 0,
        AuthorizationId: this.authorizationIdForPermissions
      }
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading unselected cards:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Transfer selected cards from unselected to selected
  transferCardsToSelected(): void {
    if (!this.unselectedCardsTable || !this.authorizationIdForPermissions) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedUnselectedCards || this.selectedUnselectedCards.length === 0) {
      this.toastr.warning('Lütfen aktarılacak kart seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedUnselectedCards.map((row: any) => {
      const id = row.CardID || row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli kart seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/Cards/AppendAuthorizationId`, {
      Selecteds: selectedIds,
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Kartlar başarıyla eklendi', 'Başarılı');
          // Clear selections
          this.selectedUnselectedCards = [];
          // Reload both tables
          if (this.selectedCardsTable) {
            this.selectedCardsTable.reload();
          }
          if (this.unselectedCardsTable) {
            this.unselectedCardsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Kartlar eklenirken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error adding cards:', error);
        const errorMessage = error.error?.message || error.message || 'Kartlar eklenirken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Transfer selected cards from selected to unselected
  transferCardsToUnselected(): void {
    if (!this.selectedCardsTable || !this.authorizationIdForPermissions) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedSelectedCards || this.selectedSelectedCards.length === 0) {
      this.toastr.warning('Lütfen kaldırılacak kart seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedSelectedCards.map((row: any) => {
      const id = row.CardID || row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli kart seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/Cards/RemoveListAuthorizationId`, {
      Selecteds: selectedIds,
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Kartlar başarıyla kaldırıldı', 'Başarılı');
          // Clear selections
          this.selectedSelectedCards = [];
          // Reload both tables
          if (this.selectedCardsTable) {
            this.selectedCardsTable.reload();
          }
          if (this.unselectedCardsTable) {
            this.unselectedCardsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Kartlar kaldırılırken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error removing cards:', error);
        const errorMessage = error.error?.message || error.message || 'Kartlar kaldırılırken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Table columns for cards
  cardsTableColumns: TableColumn[] = [
    { 
      field: 'CardID', 
      label: 'ID', 
      text: 'ID',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '80px', 
      size: '80px',
      searchable: 'int',
      resizable: true
    },
    { 
      field: 'CardCode', 
      label: 'Kart Kodu', 
      text: 'Kart Kodu',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'CardCodeType', 
      label: 'Kart Kodu Tipi', 
      text: 'Kart Kodu Tipi',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'CardDesc', 
      label: 'Açıklama', 
      text: 'Açıklama',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '200px', 
      size: '200px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'CardUID', 
      label: 'UID', 
      text: 'UID',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'TagCode', 
      label: 'Tag Kodu', 
      text: 'Tag Kodu',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'Status', 
      label: 'Durum', 
      text: 'Durum',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '100px', 
      size: '100px',
      searchable: 'text',
      resizable: true
    }
  ];

  onSave = (data: any, isEdit: boolean): Observable<any> => {
    const url = `${environment.apiUrl}/api/Authorizations/form`;
    const recid = data.Id || data.recid || null;
    const { Id, recid: _, ...record } = data;
    return this.http.post(url, {
      request: { action: 'save', recid: recid, name: isEdit ? 'EditAuthorization' : 'AddAuthorization', record: record }
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

  onFormChange = (formData: any) => {};
  constructor(private http: HttpClient, private toastr: ToastrService, public translate: TranslateService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {}
  onTableRowClick(event: any): void {}
  onTableRowDblClick(event: any): void {}
  onTableRowSelect(event: any): void {
    // Store selected authorization for settings menu
    if (event && event.record) {
      this.selectedAuthorization = event.record;
    } else if (event && Array.isArray(event) && event.length > 0) {
      this.selectedAuthorization = event[0];
    } else {
      this.selectedAuthorization = null;
    }
  }
  onTableRefresh(): void {
    if (!this.isReloading && this.dataTableComponent) {
      this.isReloading = true;
      setTimeout(() => { this.isReloading = false; }, 1000);
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
      if (id !== null && id !== undefined) { selectedIds.push(Number(id)); }
    });
    if (selectedIds.length === 0) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }
    this.http.post(`${environment.apiUrl}/api/Authorizations/delete`, { request: { action: 'delete', recid: selectedIds } }).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.toastr.success(this.translate.instant('common.deleteSuccess'), this.translate.instant('common.success'));
          if (!this.isReloading && this.dataTableComponent) {
            this.isReloading = true;
            setTimeout(() => {
              if (this.dataTableComponent) {
                this.dataTableComponent.reload();
                setTimeout(() => { this.isReloading = false; }, 500);
              } else { this.isReloading = false; }
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

  onTableAdd(): void { if (this.dataTableComponent) { this.dataTableComponent.openAddForm(); } }
  onTableEdit(event: any): void { if (event && event.selectedRecord) { if (this.dataTableComponent) { this.dataTableComponent.openEditForm(event.selectedRecord); } } }
  onAdvancedFilterChange(event: any): void {}
}
