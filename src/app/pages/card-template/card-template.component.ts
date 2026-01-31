// CardTemplate Component
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Import configurations
import { joinOptions } from './card-template-config';
import { tableColumns } from './card-template-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './card-template-form-config';

// Import types from DataTableComponent
import { 
  DataTableComponent, 
  TableColumn, 
  ToolbarConfig, 
  GridResponse, 
  JoinOption,
  FormTab,
  ToolbarItem
} from 'src/app/components/data-table/data-table.component';

@Component({
  selector: 'app-card-template',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule, 
    TablerIconsModule,
    TranslateModule,
    DataTableComponent
  ],
  templateUrl: './card-template.component.html',
  styleUrls: ['./card-template.component.scss']
})
export class CardTemplateComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;

  private isReloading: boolean = false;
  private selectedRows: any[] = [];

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
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CardTemplates`, {
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
        console.error('Error loading card templates:', error);
        return of({
          status: 'error' as const,
          total: 0,
          records: []
        } as GridResponse);
      })
    );
  };

  // Toolbar configuration with custom buttons
  get tableToolbarConfig(): ToolbarConfig {
    return {
      items: [
        {
          id: 'delete-template',
          type: 'button',
          text: this.translate.instant('common.delete') || 'Sil',
          icon: 'cross',
          onClick: (event: MouseEvent, item: ToolbarItem) => {
            this.onDeleteTemplate();
          }
        },
        {
          id: 'create-template',
          type: 'button',
          text: this.translate.instant('cardTemplate.createTemplate') || 'Şablon Oluşturma',
          icon: 'plus',
          onClick: (event: MouseEvent, item: ToolbarItem) => {
            this.onCreateTemplate();
          }
        },
        {
          id: 'update-template',
          type: 'button',
          text: this.translate.instant('cardTemplate.updateTemplate') || 'Şablon Güncelleme',
          icon: 'pencil',
          onClick: (event: MouseEvent, item: ToolbarItem) => {
            this.onUpdateTemplate();
          }
        }
      ],
      show: {
        reload: true,
        columns: true,
        search: true,
        add: false, // Hide default add button, using custom button instead
        edit: false, // Hide default edit button, using custom button instead
        delete: false, // Hide default delete button, using custom button instead
        save: false
      }
    };
  }

  // Save handler
  onSave = (data: any, isEdit: boolean): Observable<any> => {
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CardTemplates/form`;
    const recid = data.Id || data.recid || null;
    const { Id, recid: _, ...record } = data;
    
    return this.http.post(url, {
      request: {
        action: 'save',
        recid: recid,
        name: isEdit ? 'EditCardTemplate' : 'AddCardTemplate',
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
    private router: Router,
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
    // Store selected rows for toolbar buttons
    this.selectedRows = Array.isArray(event) ? event : [event];
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
    // This is called by default delete button (which is hidden)
    // Custom delete is handled by onDeleteTemplate()
  }

  onTableAdd(): void {
    // This is called by default add button (which is hidden)
    // Custom add is handled by onCreateTemplate()
  }

  onTableEdit(event: any): void {
    // This is called by default edit button (which is hidden)
    // Custom edit is handled by onUpdateTemplate()
  }

  onAdvancedFilterChange(event: any): void {
    // Handle advanced filter change
  }

  // Custom toolbar button handlers
  onDeleteTemplate(): void {
    if (!this.selectedRows || this.selectedRows.length === 0) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }

    const selectedIds: number[] = [];
    this.selectedRows.forEach((row: any) => {
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
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CardTemplates/delete`, {
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

  onCreateTemplate(): void {
    // Navigate to editor page for new template
    this.router.navigate(['/CardTemplates/editor']);
  }

  onUpdateTemplate(): void {
    if (!this.selectedRows || this.selectedRows.length === 0) {
      this.toastr.warning('Lütfen güncellemek için bir şablon seçin.', this.translate.instant('common.warning'));
      return;
    }

    if (this.selectedRows.length > 1) {
      this.toastr.warning('Lütfen sadece bir şablon seçin.', this.translate.instant('common.warning'));
      return;
    }

    // Navigate to editor page with template ID
    const templateId = this.selectedRows[0].Id || this.selectedRows[0].id || this.selectedRows[0].recid;
    this.router.navigate(['/CardTemplates/editor', templateId]);
  }
}
