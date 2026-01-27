// Authorizations Component
import { Component, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { joinOptions } from './authorizations-config';
import { tableColumns } from './authorizations-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './authorizations-form-config';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, JoinOption, FormTab, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { navItems } from 'src/app/layouts/full/vertical/sidebar/sidebar-data';
import { NavItem } from 'src/app/layouts/full/vertical/sidebar/nav-item/nav-item';

interface PageVisibilityItem {
  route: string;
  displayName: string;
  isVisible: boolean;
  children?: PageVisibilityItem[];
  level?: number;
}

@Component({
  selector: 'app-authorizations',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule, DataTableComponent, ModalComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './authorizations.component.html',
  styleUrls: ['./authorizations.component.scss']
})
export class AuthorizationsComponent implements OnInit, AfterViewInit {
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
  @ViewChild('selectedAccessGroupsTable') selectedAccessGroupsTable?: DataTableComponent;
  @ViewChild('unselectedAccessGroupsTable') unselectedAccessGroupsTable?: DataTableComponent;
  @ViewChild('selectedTerminalsTable') selectedTerminalsTable?: DataTableComponent;
  @ViewChild('unselectedTerminalsTable') unselectedTerminalsTable?: DataTableComponent;
  @ViewChild('secureFieldsTable') secureFieldsTable?: DataTableComponent;
  private isReloading: boolean = false;
  selectedAuthorization: any = null;
  showPermissionsModal: boolean = false;
  showCompanyPermissionsModal: boolean = false;
  showStaffPermissionsModal: boolean = false;
  showDepartmentPermissionsModal: boolean = false;
  showCardPermissionsModal: boolean = false;
  showAccessPermissionsModal: boolean = false;
  showTerminalPermissionsModal: boolean = false;
  showSecureFieldsPermissionsModal: boolean = false;
  showPageVisibilityModal: boolean = false;
  authorizationIdForPermissions: number | null = null;
  gridHeight: string = '500px';
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
  selectedUnselectedAccessGroups: any[] = [];
  selectedSelectedAccessGroups: any[] = [];
  selectedUnselectedTerminals: any[] = [];
  selectedSelectedTerminals: any[] = [];
  pageVisibilityItems: PageVisibilityItem[] = [];
  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;
  
  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Authorizations`, {
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
            },
            {
              id: 'secure-fields-permissions',
              text: 'Güvenli Girdi Yetkileri',
              onClick: (event) => this.openSettingsModal('secure-fields-permissions')
            },
            {
              id: 'page-visibility',
              text: 'Sayfa Görünürlük',
              onClick: (event) => this.openSettingsModal('page-visibility')
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
    } else if (settingsType === 'access-permissions') {
      this.authorizationIdForPermissions = authorizationId;
      this.showAccessPermissionsModal = true;
      // Reload tables after a short delay to ensure modal is rendered
      setTimeout(() => {
        if (this.selectedAccessGroupsTable) {
          this.selectedAccessGroupsTable.reload();
        }
        if (this.unselectedAccessGroupsTable) {
          this.unselectedAccessGroupsTable.reload();
        }
      }, 100);
    } else if (settingsType === 'terminal-permissions') {
      this.authorizationIdForPermissions = authorizationId;
      this.showTerminalPermissionsModal = true;
      // Reload tables after a short delay to ensure modal is rendered
      setTimeout(() => {
        if (this.selectedTerminalsTable) {
          this.selectedTerminalsTable.reload();
        }
        if (this.unselectedTerminalsTable) {
          this.unselectedTerminalsTable.reload();
        }
      }, 100);
    } else if (settingsType === 'secure-fields-permissions') {
      this.authorizationIdForPermissions = authorizationId;
      this.showSecureFieldsPermissionsModal = true;
      // Reload table after a short delay to ensure modal is rendered
      setTimeout(() => {
        if (this.secureFieldsTable) {
          this.secureFieldsTable.reload();
        }
        // Re-attach checkbox listeners after reload
        setTimeout(() => this.attachSecureFieldsCheckboxListeners(), 200);
      }, 100);
    } else if (settingsType === 'page-visibility') {
      this.authorizationIdForPermissions = authorizationId;
      this.showPageVisibilityModal = true;
      // Load page visibility data
      setTimeout(() => {
        this.loadPageVisibilityData();
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

  closeAccessPermissionsModal(): void {
    this.showAccessPermissionsModal = false;
    this.authorizationIdForPermissions = null;
    this.selectedUnselectedAccessGroups = [];
    this.selectedSelectedAccessGroups = [];
  }

  closeTerminalPermissionsModal(): void {
    this.showTerminalPermissionsModal = false;
    this.authorizationIdForPermissions = null;
    this.selectedUnselectedTerminals = [];
    this.selectedSelectedTerminals = [];
  }
  // SecureFields form
  secureFieldForm: FormGroup;

  // SecureFields table columns
  secureFieldsTableColumns: TableColumn[] = [
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
      field: 'Source', 
      label: 'Kaynak', 
      text: 'Kaynak',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '200px', 
      size: '200px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'Field', 
      label: 'Alan', 
      text: 'Alan',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '200px', 
      size: '200px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'Description', 
      label: 'Açıklama', 
      text: 'Açıklama',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '250px', 
      size: '250px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'IsSeen', 
      label: 'Görüntüleme', 
      text: 'Görüntüleme',
      type: 'checkbox' as ColumnType, 
      sortable: true, 
      width: '120px', 
      size: '120px',
      searchable: false,
      resizable: true,
      editable:true
    },
    { 
      field: 'IsEdit', 
      label: 'Düzenleme', 
      text: 'Düzenleme',
      type: 'checkbox' as ColumnType, 
      sortable: true, 
      width: '120px', 
      size: '120px',
      searchable: false,
      resizable: true,
      editable:true
    }
  ];

  onCellCheckboxChange($event: { row: TableRow; column: TableColumn; rowIndex: number; columnIndex: number; newValue: boolean; oldValue: boolean; }) {
    if (!this.authorizationIdForPermissions) {
      this.toastr.warning('Geçersiz yetki seçimi', 'Uyarı');
      return;
    }

    const secureFieldId = $event.row['Id'] || $event.row['recid'];
    if (!secureFieldId) {
      this.toastr.warning('Geçersiz güvenli girdi ID', 'Uyarı');
      return;
    }

    // Get current values from row (these reflect the current state)
    const currentIsSeen = $event.row['IsSeen'] === true || $event.row['IsSeen'] === 1 || $event.row['IsSeen'] === 'true' || $event.row['IsSeen'] === '1';
    const currentIsEdit = $event.row['IsEdit'] === true || $event.row['IsEdit'] === 1 || $event.row['IsEdit'] === 'true' || $event.row['IsEdit'] === '1';

    // First, check if a record exists in AuthorizationSecureFields
    // Get the existing permission record ID if it exists
    this.http.post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/SecureFields/GetAllByAuthorizationId`, {
      limit: -1,
      offset: 0,
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        const permissions = Array.isArray(response) ? response : (response.records || response.data || []);
        
        // Find existing record with matching AuthorizationId and SecureFieldId
        const existingRecord = permissions.find((perm: any) => {
          const fieldId = perm.SecureFieldId || perm.Id || perm.SecureField?.Id || perm.recid;
          return Number(fieldId) === Number(secureFieldId);
        });

        // Build request payload
        const request: any = {
          AuthorizationId: this.authorizationIdForPermissions,
          SecureFieldId: secureFieldId
        };

        // If record exists, include the Id for update
        if (existingRecord) {
          const recordId = existingRecord.Id || existingRecord.recid || existingRecord.AuthorizationSecureFieldId;
          if (recordId) {
            request.Id = recordId;
          }
        }

        // Set the changed field to new value
        if ($event.column.field === 'IsSeen') {
          request.IsSeen = $event.newValue;
          // Keep existing IsEdit value from existing record, or set to false if new
          if (existingRecord) {
            const existingIsEdit = existingRecord.IsEdit === true || existingRecord.IsEdit === 1 || existingRecord.IsEdit === 'true' || existingRecord.IsEdit === '1';
            request.IsEdit = existingIsEdit;
          } else {
            request.IsEdit = currentIsEdit !== undefined ? currentIsEdit : false;
          }
        } else if ($event.column.field === 'IsEdit') {
          request.IsEdit = $event.newValue;
          // Keep existing IsSeen value from existing record, or set to false if new
          if (existingRecord) {
            const existingIsSeen = existingRecord.IsSeen === true || existingRecord.IsSeen === 1 || existingRecord.IsSeen === 'true' || existingRecord.IsSeen === '1';
            request.IsSeen = existingIsSeen;
          } else {
            request.IsSeen = currentIsSeen !== undefined ? currentIsSeen : false;
          }
        }

        // Send update/create request
        this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/SecureFields/UpdateAuthorizationPermission`, request).subscribe({
          next: (updateResponse: any) => {
            if (updateResponse.error === false || updateResponse.status === 'success') {
              // Update the row data immediately to reflect the change
              $event.row[$event.column.field] = $event.newValue;
              
              // Reload table to ensure consistency
              if (this.secureFieldsTable) {
                this.secureFieldsTable.reload();
              }
            } else {
              // Revert the change on error
              $event.row[$event.column.field] = $event.oldValue;
              this.toastr.error(updateResponse.message || 'Güncelleme başarısız', 'Hata');
            }
          },
          error: (error: any) => {
            console.error('Error updating secure field:', error);
            // Revert the change on error
            $event.row[$event.column.field] = $event.oldValue;
            const errorMessage = error.error?.message || error.message || 'Güncelleme başarısız';
            this.toastr.error(errorMessage, 'Hata');
          }
        });
      },
      error: (error: any) => {
        console.error('Error checking existing permission:', error);
        this.toastr.error('Mevcut kayıt kontrol edilemedi', 'Hata');
      }
    });
  }

  // Data source for secure fields
  secureFieldsDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    
    // First, get all SecureFields
    const allSecureFieldsRequest = this.http.post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/SecureFields`, {
      page: 1,
      limit: -1,
      offset: 0
    }).pipe(
      map((response: any) => {
        // Handle GridResponse format: { status, total, records }
        if (response && response.records && Array.isArray(response.records)) {
          return response.records;
        }
        // Handle direct array
        if (Array.isArray(response)) {
          return response;
        }
        // Handle other formats
        return response.data || [];
      }),
      catchError(error => {
        console.error('Error loading all secure fields:', error);
        return of([]);
      })
    );
    
    // Then, get authorization-specific permissions
    const authorizationPermissionsRequest = this.http.post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/SecureFields/GetAllByAuthorizationId`, {
      limit: -1,
      offset: 0,
      AuthorizationId: this.authorizationIdForPermissions
    }).pipe(
      map((response: any) => {
        // Handle GridResponse format: { status, total, records }
        if (response && response.records && Array.isArray(response.records)) {
          return response.records;
        }
        // Handle direct array
        if (Array.isArray(response)) {
          return response;
        }
        // Handle other formats
        return response.data || [];
      }),
      catchError(error => {
        console.error('Error loading authorization permissions:', error);
        return of([]);
      })
    );
    
    // Combine both requests
    return forkJoin({
      allFields: allSecureFieldsRequest,
      permissions: authorizationPermissionsRequest
    }).pipe(
      map(({ allFields, permissions }) => {
        // Create a map of permissions by SecureFieldId for quick lookup
        const permissionsMap = new Map();
        
        // Process permissions array
        if (Array.isArray(permissions) && permissions.length > 0) {
          permissions.forEach((perm: any) => {
            // Try different possible field names for SecureField ID
            const fieldId = perm.SecureFieldId || perm.Id || perm.SecureField?.Id || perm.recid;
            if (fieldId !== null && fieldId !== undefined) {
              // Handle boolean values (true/false, 1/0, "true"/"false")
              const isSeen = perm.IsSeen === true || perm.IsSeen === 1 || perm.IsSeen === 'true' || perm.IsSeen === '1';
              const isEdit = perm.IsEdit === true || perm.IsEdit === 1 || perm.IsEdit === 'true' || perm.IsEdit === '1';
              
              permissionsMap.set(Number(fieldId), {
                IsSeen: isSeen,
                IsEdit: isEdit
              });
            }
          });
        }
        
        // Merge all fields with their permission status (default to false)
        const mergedRecords = (allFields || []).map((field: any) => {
          const fieldId = Number(field.Id || field.recid);
          const permission = permissionsMap.get(fieldId); 
          // Default to false if no permission found
          return {
            ...field,
            IsSeen: permission ? permission.IsSeen : false,
            IsEdit: permission ? permission.IsEdit : false
          };
        });
        return {
          status: 'success' as const,
          total: mergedRecords.length,
          records: mergedRecords
        } as GridResponse;
      }),
      catchError(error => {
        console.error('Error combining secure fields data:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Save secure field
  saveSecureField(): void {
    if (!this.secureFieldForm.valid) {
      this.toastr.warning('Lütfen tüm alanları doldurun', 'Uyarı');
      return;
    }

    if (!this.authorizationIdForPermissions) {
      this.toastr.warning('Geçersiz yetki seçimi', 'Uyarı');
      return;
    }

    const formValue = this.secureFieldForm.value;
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/SecureFields/form`, {
      request: {
        action: 'save',
        recid: null,
        name: 'AddSecureField',
        record: {
          Source: formValue.Source,
          Field: formValue.Field,
          AuthorizationId: this.authorizationIdForPermissions
        }
      }
    }).subscribe({
      next: (response: any) => {
        if (response.error === false || response.status === 'success') {
          this.toastr.success('Güvenli girdi başarıyla eklendi', 'Başarılı');
          this.secureFieldForm.reset();
          if (this.secureFieldsTable) {
            this.secureFieldsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Güvenli girdi eklenirken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error saving secure field:', error);
        const errorMessage = error.error?.message || error.message || 'Güvenli girdi eklenirken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Delete secure field
  deleteSecureField(event: any): void {
    if (!event || (Array.isArray(event) && event.length === 0)) {
      this.toastr.warning('Lütfen silinecek kayıt seçin', 'Uyarı');
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
      this.toastr.warning('Lütfen silinecek kayıt seçin', 'Uyarı');
      return;
    }

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/SecureFields/delete`, {
      request: { action: 'delete', recid: selectedIds }
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.toastr.success('Güvenli girdi başarıyla silindi', 'Başarılı');
          if (this.secureFieldsTable) {
            this.secureFieldsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Güvenli girdi silinirken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Delete error:', error);
        const errorMessage = error.error?.message || error.message || 'Güvenli girdi silinirken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Update secure field checkbox
  updateSecureFieldCheckbox(secureFieldId: number, field: 'IsSeen' | 'IsEdit', checked: boolean): void {
    if (!this.authorizationIdForPermissions) {
      return;
    }

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/SecureFields/UpdateAuthorizationPermission`, {
      SecureFieldId: secureFieldId,
      AuthorizationId: this.authorizationIdForPermissions,
      Field: field,
      Value: checked
    }).subscribe({
      next: (response: any) => {
        if (response.error === false || response.status === 'success') {
          // Reload table to reflect changes
          if (this.secureFieldsTable) {
            this.secureFieldsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Güncelleme başarısız', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error updating secure field checkbox:', error);
        const errorMessage = error.error?.message || error.message || 'Güncelleme başarısız';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  closeSecureFieldsPermissionsModal(): void {
    this.showSecureFieldsPermissionsModal = false;
    this.authorizationIdForPermissions = null;
    this.secureFieldForm.reset();
  }

  closePageVisibilityModal(): void {
    this.showPageVisibilityModal = false;
    this.authorizationIdForPermissions = null;
    this.pageVisibilityItems = [];
  }

  // Extract all routes from navItems recursively
  private extractRoutesFromNavItems(items: NavItem[], level: number = 0): PageVisibilityItem[] {
    const result: PageVisibilityItem[] = [];
    
    for (const item of items) {
      // Skip items without routes and children (dividers, captions, etc.)
      if (!item.route && (!item.children || item.children.length === 0)) {
        continue;
      }

      // Skip navCap and divider items
      if (item.navCap || item.divider) {
        // But process their children if they exist
        if (item.children && item.children.length > 0) {
          result.push(...this.extractRoutesFromNavItems(item.children, level));
        }
        continue;
      }

      const pageItem: PageVisibilityItem = {
        route: item.route || '',
        displayName: item.displayName || '',
        isVisible: false,
        level: level
      };

      // Process children recursively
      if (item.children && item.children.length > 0) {
        pageItem.children = this.extractRoutesFromNavItems(item.children, level + 1);
      }

      // Only add items that have routes or children
      if (pageItem.route || (pageItem.children && pageItem.children.length > 0)) {
        result.push(pageItem);
      }
    }

    return result;
  }

  // Load page visibility data
  loadPageVisibilityData(): void {
    if (!this.authorizationIdForPermissions) {
      return;
    }

    // Extract all routes from sidebar
    const allRoutes = this.extractRoutesFromNavItems(navItems);

    // Load saved visibility settings from API
    this.http.post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Authorizations/GetPageVisibility`, {
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        let visibleRoutes: string[] = [];
        
        // Handle different response formats
        if (Array.isArray(response)) {
          visibleRoutes = response;
        } else if (response && response.data) {
          // Handle format: { status: "success", data: { VisibleRoutes: [] } }
          if (Array.isArray(response.data.VisibleRoutes)) {
            visibleRoutes = response.data.VisibleRoutes;
          } else if (Array.isArray(response.data)) {
            visibleRoutes = response.data;
          } else if (response.data.visibleRoutes && Array.isArray(response.data.visibleRoutes)) {
            visibleRoutes = response.data.visibleRoutes;
          }
        } else if (response && Array.isArray(response.records)) {
          visibleRoutes = response.records;
        } else if (response && Array.isArray(response.visibleRoutes)) {
          visibleRoutes = response.visibleRoutes;
        }

        // Mark routes as visible if they're in the saved list
        const markVisible = (items: PageVisibilityItem[]) => {
          items.forEach(item => {
            if (item.route && visibleRoutes.includes(item.route)) {
              item.isVisible = true;
            }
            if (item.children) {
              markVisible(item.children);
            }
          });
        };

        markVisible(allRoutes);
        this.pageVisibilityItems = allRoutes;
        
        // Update parent visibility based on children after marking visible routes
        this.updateAllParentsVisibility();
      },
      error: (error: any) => {
        console.error('Error loading page visibility:', error);
        // If API fails, just show all routes as unchecked
        this.pageVisibilityItems = allRoutes;
      }
    });
  }

  // Toggle page visibility
  togglePageVisibility(item: PageVisibilityItem): void {
    item.isVisible = !item.isVisible;
    
    // If parent is toggled, toggle all children
    if (item.children && item.children.length > 0) {
      item.children.forEach(child => {
        child.isVisible = item.isVisible;
        if (child.children) {
          this.toggleChildrenVisibility(child, item.isVisible);
        }
      });
    }
    
    // Update all parent visibility based on children
    this.updateAllParentsVisibility();
  }

  // Update all parent visibility based on their children
  private updateAllParentsVisibility(): void {
    const updateParents = (items: PageVisibilityItem[]): void => {
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          // First, update children recursively
          updateParents(item.children);
          
          // Then check if any child is visible
          const hasVisibleChild = item.children.some(child => 
            child.isVisible || (child.children && this.hasAnyVisibleDescendant(child))
          );
          
          // If item has no route and has visible children, make it visible
          if (!item.route && hasVisibleChild) {
            item.isVisible = true;
          }
          // If item has no route and no visible children, make it invisible
          else if (!item.route && !hasVisibleChild) {
            item.isVisible = false;
          }
          // If item has a route, its visibility is independent of children
        }
      });
    };
    
    updateParents(this.pageVisibilityItems);
  }

  // Check if item or any of its descendants are visible
  private hasAnyVisibleDescendant(item: PageVisibilityItem): boolean {
    if (item.isVisible) {
      return true;
    }
    if (item.children && item.children.length > 0) {
      return item.children.some(child => child.isVisible || this.hasAnyVisibleDescendant(child));
    }
    return false;
  }

  // Recursively toggle children visibility
  private toggleChildrenVisibility(item: PageVisibilityItem, visible: boolean): void {
    item.isVisible = visible;
    if (item.children) {
      item.children.forEach(child => {
        this.toggleChildrenVisibility(child, visible);
      });
    }
  }

  // Collect all visible routes recursively
  private collectVisibleRoutes(items: PageVisibilityItem[]): string[] {
    const routes: string[] = [];
    
    items.forEach(item => {
      if (item.isVisible && item.route) {
        routes.push(item.route);
      }
      if (item.children) {
        routes.push(...this.collectVisibleRoutes(item.children));
      }
    });

    return routes;
  }

  // Save page visibility settings
  savePageVisibility(): void {
    if (!this.authorizationIdForPermissions) {
      this.toastr.warning('Geçersiz yetki seçimi', 'Uyarı');
      return;
    }

    const visibleRoutes = this.collectVisibleRoutes(this.pageVisibilityItems);

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Authorizations/SavePageVisibility`, {
      AuthorizationId: this.authorizationIdForPermissions,
      VisibleRoutes: visibleRoutes
    }).subscribe({
      next: (response: any) => {
        if (response.error === false || response.status === 'success') {
          this.toastr.success('Sayfa görünürlük ayarları başarıyla kaydedildi', 'Başarılı');
          this.closePageVisibilityModal();
        } else {
          this.toastr.error(response.message || 'Kaydetme başarısız', 'Hata');
        }
      },
      error: (error: any) => {
        console.error('Error saving page visibility:', error);
        const errorMessage = error.error?.message || error.message || 'Kaydetme başarısız';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Data source for selected claims
  selectedClaimsDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/OperationClaims/GetSelectedByAuthorizationId`, {
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
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/OperationClaims/GetUnSelectedByAuthorizationId`, {
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

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/OperationClaims/AppendAuthorizationId`, {
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

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/OperationClaims/RemoveListAuthorizationId`, {
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

  // Toolbar config for secure fields table
  get secureFieldsTableToolbarConfig(): ToolbarConfig {
    return {
      items: [],
      show: {
        reload: true,
        columns: true,
        search: true,
        add: false,
        edit: false,
        delete: true,
        save: false
      }
    };
  }

  // Data source for selected companies
  selectedCompaniesDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/PdksCompanys/GetSelectedByAuthorizationId`, {
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
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/PdksCompanys/GetUnSelectedByAuthorizationId`, {
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

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/PdksCompanys/AppendAuthorizationId`, {
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

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/PdksCompanys/RemoveListAuthorizationId`, {
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
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/PdksStaffs/GetSelectedByAuthorizationId`, {
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
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/PdksStaffs/GetUnSelectedByAuthorizationId`, {
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

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/PdksStaffs/AppendAuthorizationId`, {
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

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/PdksStaffs/RemoveListAuthorizationId`, {
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
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Departments/GetSelectedByAuthorizationId`, {
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
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Departments/GetUnSelectedByAuthorizationId`, {
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

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Departments/AppendAuthorizationId`, {
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

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Departments/RemoveListAuthorizationId`, {
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
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/GetSelectedByAuthorizationId`, {
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
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/GetUnSelectedByAuthorizationId`, {
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

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/AppendAuthorizationId`, {
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

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/RemoveListAuthorizationId`, {
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

  // Data source for selected access groups
  selectedAccessGroupsDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/AccessGroups/GetSelectedByAuthorizationId`, {
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
        console.error('Error loading selected access groups:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Data source for unselected access groups
  unselectedAccessGroupsDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/AccessGroups/GetUnSelectedByAuthorizationId`, {
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
        console.error('Error loading unselected access groups:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Transfer selected access groups from unselected to selected
  transferAccessGroupsToSelected(): void {
    if (!this.unselectedAccessGroupsTable || !this.authorizationIdForPermissions) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedUnselectedAccessGroups || this.selectedUnselectedAccessGroups.length === 0) {
      this.toastr.warning('Lütfen aktarılacak geçiş grubu seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedUnselectedAccessGroups.map((row: any) => {
      const id = row.AccessGroupID || row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli geçiş grubu seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/AccessGroups/AppendAuthorizationId`, {
      Selecteds: selectedIds,
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Geçiş grupları başarıyla eklendi', 'Başarılı');
          // Clear selections
          this.selectedUnselectedAccessGroups = [];
          // Reload both tables
          if (this.selectedAccessGroupsTable) {
            this.selectedAccessGroupsTable.reload();
          }
          if (this.unselectedAccessGroupsTable) {
            this.unselectedAccessGroupsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Geçiş grupları eklenirken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error adding access groups:', error);
        const errorMessage = error.error?.message || error.message || 'Geçiş grupları eklenirken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Transfer selected access groups from selected to unselected
  transferAccessGroupsToUnselected(): void {
    if (!this.selectedAccessGroupsTable || !this.authorizationIdForPermissions) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedSelectedAccessGroups || this.selectedSelectedAccessGroups.length === 0) {
      this.toastr.warning('Lütfen kaldırılacak geçiş grubu seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedSelectedAccessGroups.map((row: any) => {
      const id = row.AccessGroupID || row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli geçiş grubu seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/AccessGroups/RemoveListAuthorizationId`, {
      Selecteds: selectedIds,
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Geçiş grupları başarıyla kaldırıldı', 'Başarılı');
          // Clear selections
          this.selectedSelectedAccessGroups = [];
          // Reload both tables
          if (this.selectedAccessGroupsTable) {
            this.selectedAccessGroupsTable.reload();
          }
          if (this.unselectedAccessGroupsTable) {
            this.unselectedAccessGroupsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Geçiş grupları kaldırılırken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error removing access groups:', error);
        const errorMessage = error.error?.message || error.message || 'Geçiş grupları kaldırılırken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Data source for selected terminals
  selectedTerminalsDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/GetSelectedByAuthorizationId`, {
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
        console.error('Error loading selected terminals:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Data source for unselected terminals
  unselectedTerminalsDataSource = (params: any) => {
    if (!this.authorizationIdForPermissions) {
      return of({ status: 'success' as const, total: 0, records: [] } as GridResponse);
    }
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/GetUnSelectedByAuthorizationId`, {
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
        console.error('Error loading unselected terminals:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Transfer selected terminals from unselected to selected
  transferTerminalsToSelected(): void {
    if (!this.unselectedTerminalsTable || !this.authorizationIdForPermissions) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedUnselectedTerminals || this.selectedUnselectedTerminals.length === 0) {
      this.toastr.warning('Lütfen aktarılacak terminal seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedUnselectedTerminals.map((row: any) => {
      const id = row.ReaderID || row.TerminalID || row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli terminal seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/AppendAuthorizationId`, {
      Selecteds: selectedIds,
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Terminaller başarıyla eklendi', 'Başarılı');
          // Clear selections
          this.selectedUnselectedTerminals = [];
          // Reload both tables
          if (this.selectedTerminalsTable) {
            this.selectedTerminalsTable.reload();
          }
          if (this.unselectedTerminalsTable) {
            this.unselectedTerminalsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Terminaller eklenirken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error adding terminals:', error);
        const errorMessage = error.error?.message || error.message || 'Terminaller eklenirken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Transfer selected terminals from selected to unselected
  transferTerminalsToUnselected(): void {
    if (!this.selectedTerminalsTable || !this.authorizationIdForPermissions) {
      return;
    }
    
    // Use the stored selected rows from rowSelect event
    if (!this.selectedSelectedTerminals || this.selectedSelectedTerminals.length === 0) {
      this.toastr.warning('Lütfen kaldırılacak terminal seçin', 'Uyarı');
      return;
    }

    // Extract IDs from selected rows
    const selectedIds = this.selectedSelectedTerminals.map((row: any) => {
      const id = row.ReaderID || row.TerminalID || row.Id || row.recid || row.id;
      return id !== null && id !== undefined ? Number(id) : null;
    }).filter((id: any) => id !== null && id !== undefined);

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli terminal seçilmedi', 'Uyarı');
      return;
    }

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/RemoveListAuthorizationId`, {
      Selecteds: selectedIds,
      AuthorizationId: this.authorizationIdForPermissions
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success' || response.error === false) {
          this.toastr.success('Terminaller başarıyla kaldırıldı', 'Başarılı');
          // Clear selections
          this.selectedSelectedTerminals = [];
          // Reload both tables
          if (this.selectedTerminalsTable) {
            this.selectedTerminalsTable.reload();
          }
          if (this.unselectedTerminalsTable) {
            this.unselectedTerminalsTable.reload();
          }
        } else {
          this.toastr.error(response.message || 'Terminaller kaldırılırken hata oluştu', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error removing terminals:', error);
        const errorMessage = error.error?.message || error.message || 'Terminaller kaldırılırken hata oluştu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  // Table columns for terminals
  terminalsTableColumns: TableColumn[] = [
    { 
      field: 'ReaderID', 
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
      field: 'SerialNumber', 
      label: 'Seri Numarası', 
      text: 'Seri Numarası',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'ReaderName', 
      label: 'Terminal Adı', 
      text: 'Terminal Adı',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '300px', 
      size: '300px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'IpAddress', 
      label: 'IP Adresi', 
      text: 'IP Adresi',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'text',
      resizable: true
    }
  ];

  // Table columns for access groups
  accessGroupsTableColumns: TableColumn[] = [
    { 
      field: 'AccessGroupID', 
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
      field: 'AccessGroupName', 
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
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Authorizations/form`;
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
  constructor(
    private http: HttpClient, 
    private toastr: ToastrService, 
    public translate: TranslateService, 
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    public elementRef: ElementRef
  ) {
    // Initialize secure field form
    this.secureFieldForm = this.fb.group({
      Source: ['', Validators.required],
      Field: ['', Validators.required]
    });
  }
  ngOnInit(): void {}
  
  ngAfterViewInit(): void {
    // Setup checkbox event listeners for secure fields
    this.setupSecureFieldsCheckboxListeners();
  }
  
  setupSecureFieldsCheckboxListeners(): void {
    // Use MutationObserver to watch for DOM changes when table reloads
    const observer = new MutationObserver(() => {
      this.attachSecureFieldsCheckboxListeners();
    });
    
    // Observe the secure fields table container
    const container = this.elementRef.nativeElement.querySelector('.secure-fields-permissions-container');
    if (container) {
      observer.observe(container, { childList: true, subtree: true });
      // Initial attachment
      setTimeout(() => this.attachSecureFieldsCheckboxListeners(), 100);
    }
  }
  
  attachSecureFieldsCheckboxListeners(): void {
    const checkboxes = this.elementRef.nativeElement.querySelectorAll('.secure-field-checkbox');
    checkboxes.forEach((checkbox: HTMLInputElement) => {
      // Remove existing listeners to prevent duplicates
      const newCheckbox = checkbox.cloneNode(true) as HTMLInputElement;
      checkbox.parentNode?.replaceChild(newCheckbox, checkbox);
      
      // Add click event listener
      newCheckbox.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        const secureFieldId = parseInt(target.getAttribute('data-id') || '0', 10);
        const field = target.getAttribute('data-field') as 'IsSeen' | 'IsEdit';
        const checked = target.checked;
        
        if (secureFieldId && field) {
          this.updateSecureFieldCheckbox(secureFieldId, field, checked);
        }
      });
    });
  }
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
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Authorizations/delete`, { request: { action: 'delete', recid: selectedIds } }).subscribe({
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
