// Card Component
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule, 
    TablerIconsModule,
    TranslateModule,
    DataTableComponent
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
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
    return this.http.post<GridResponse>(`${environment.apiUrl}/api/Cards`, {
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
  onSave = (data: any, isEdit: boolean) => {
    const url = `${environment.apiUrl}/api/Cards/form`;
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
    // Handle delete
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
}
