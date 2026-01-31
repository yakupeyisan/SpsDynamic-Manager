// PdksStaff (Kadro) Component
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
import { joinOptions } from './pdks-staff-config';
import { tableColumns } from './pdks-staff-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './pdks-staff-form-config';

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
  selector: 'app-pdks-staff',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule, 
    TablerIconsModule,
    TranslateModule,
    DataTableComponent
  ],
  templateUrl: './pdks-staff.component.html',
  styleUrls: ['./pdks-staff.component.scss']
})
export class PdksStaffComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;

  private isReloading: boolean = false;

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
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/PdksStaffs`, {
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
        console.error('Error loading staffs:', error);
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
      items: [],
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
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/PdksStaffs/form`;
    const recid = data.ID || data.recid || null;
    const { ID, recid: _, ...record } = data;
    
    return this.http.post(url, {
      request: {
        action: 'save',
        recid: recid,
        name: isEdit ? 'EditPdksStaff' : 'AddPdksStaff',
        record: record
      }
    }).pipe(
      map((response: any) => {
        // Check if save was successful
        // API returns { error: false, record: {...} } for success or { error: true, message: '...' } for error
        if (response.error === false || response.status === 'success') {
          this.toastr.success(this.translate.instant('common.saveSuccess'), this.translate.instant('common.success'));
          // Return success response - DataTableComponent will handle closing form and reloading grid
          return { error: false, record: response.record || response };
        } else {
          // Error response
          this.toastr.error(response.message || this.translate.instant('common.saveError'), this.translate.instant('common.error'));
          // Return error response - DataTableComponent will keep form open
          return { error: true, message: response.message || this.translate.instant('common.saveError') };
        }
      }),
      catchError(error => {
        this.toastr.error(this.translate.instant('common.saveError'), this.translate.instant('common.error'));
        // Return error response - DataTableComponent will keep form open
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
    // refresh event is emitted by reload(), so we don't need to call reload() again
    // This prevents infinite loop: reload() -> refresh.emit() -> onTableRefresh() -> reload() -> ...
    // Just update the flag to prevent multiple simultaneous reloads
    if (!this.isReloading && this.dataTableComponent) {
      this.isReloading = true;
      setTimeout(() => {
        this.isReloading = false;
      }, 1000);
    }
  }

  onTableDelete(event: any): void {
    // event is an array of selected rows
    if (!event || (Array.isArray(event) && event.length === 0)) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }

    // Extract ID from selected rows
    const selectedIds: number[] = [];
    const rows = Array.isArray(event) ? event : [event];
    
    rows.forEach((row: any) => {
      const id = row.ID || row.recid || row.id;
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
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/PdksStaffs/delete`, {
      request: {
        action: 'delete',
        recid: selectedIds
      }
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.toastr.success(this.translate.instant('common.deleteSuccess'), this.translate.instant('common.success'));
          // Reload table after a short delay to prevent multiple rapid calls
          // Use flag to prevent multiple simultaneous reloads
          if (!this.isReloading && this.dataTableComponent) {
            this.isReloading = true;
            // Use setTimeout to break the potential event loop
            setTimeout(() => {
              if (this.dataTableComponent) {
                this.dataTableComponent.reload();
                // Reset flag after reload completes
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
}
