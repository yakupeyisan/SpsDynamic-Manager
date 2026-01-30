// UsedAvailableCard Component
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
import { joinOptions } from './used-available-card-config';
import { tableColumns } from './used-available-card-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './used-available-card-form-config';

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
  selector: 'app-used-available-card',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule, 
    TablerIconsModule,
    TranslateModule,
    DataTableComponent
  ],
  templateUrl: './used-available-card.component.html',
  styleUrls: ['./used-available-card.component.scss']
})
export class UsedAvailableCardComponent implements OnInit {
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
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/UsedAvailableCards`, {
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
        console.error('Error loading used available cards:', error);
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
        { type: 'break' as const, id: 'break-before-return' },
        {
          id: 'returnCard',
          type: 'button' as const,
          text: 'Kartı İade',
          icon: 'fa fa-undo',
          onClick: (event: MouseEvent, item: any) => this.onReturnAvailableCard(event, item)
        }
      ],
      show: {
        reload: true,
        columns: true,
        search: true,
        add: false,
        edit: false,
        delete: false,
        save: false
      }
    };
  }

  // Save handler (not used for read-only view)
  onSave = (data: any, isEdit: boolean) => {
    return of(null);
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

  /**
   * Return selected used temporary card(s) back to available pool
   */
  onReturnAvailableCard(_event: MouseEvent, _item: any): void {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }

    const selected = this.dataTableComponent.selectedRows;
    if (selected.size === 0) {
      this.toastr.warning('Lütfen iade etmek için en az bir kart seçiniz.');
      return;
    }

    const cardIds = Array.from(selected)
      .map((x: any) => Number(x))
      .filter((x) => !isNaN(x));

    if (cardIds.length === 0) {
      this.toastr.warning('Geçerli kart seçilmedi.');
      return;
    }

    if (!confirm(`${cardIds.length} kart iade edilecek. Onaylıyor musunuz?`)) {
      return;
    }

    // NOTE: Backend endpoint name may differ. This matches existing naming style used elsewhere (delete, setEmployee).
    this.http
      .post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/UsedAvailableCards/freeAvailable`, {
        Selecteds: cardIds
      })
      .pipe(
        catchError((error) => {
          console.error('Error returning available cards:', error);
          const msg = error?.error?.message || error?.message || 'Kart iade edilirken hata oluştu.';
          this.toastr.error(msg, 'Hata');
          return of(null);
        })
      )
      .subscribe((response: any) => {
        const ok = response?.error === false || response?.status === 'success' || response?.success === true;
        if (ok) {
          this.toastr.success('Kart(lar) başarıyla iade edildi.', 'Başarılı');
          this.dataTableComponent?.reload();
        } else {
          this.toastr.error(response?.message || 'Kart iade edilemedi.', 'Hata');
        }
      });
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
    // Handle delete (not applicable for read-only view)
  }

  onTableAdd(): void {
    // Handle add (not applicable for read-only view)
  }

  onTableEdit(event: any): void {
    // Handle edit (not applicable for read-only view)
  }

  onAdvancedFilterChange(event: any): void {
    // Handle advanced filter change
  }
}
