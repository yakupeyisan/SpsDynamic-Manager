// RequestClaims Component
import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { joinOptions } from './request-claims-config';
import { tableColumns as baseTableColumns } from './request-claims-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './request-claims-form-config';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, JoinOption, FormTab } from 'src/app/components/data-table/data-table.component';
import { RequestClaimActionDialogComponent } from 'src/app/dialogs/request-claim-action-dialog/request-claim-action-dialog.component';

@Component({
  selector: 'app-request-claims',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule, DataTableComponent],
  templateUrl: './request-claims.component.html',
  styleUrls: ['./request-claims.component.scss']
})
export class RequestClaimsComponent implements OnInit, AfterViewInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  @ViewChild('actionsCell') actionsCellRef?: TemplateRef<any>;
  private isReloading: boolean = false;
  tableColumns: TableColumn[] = [];
  joinOptions: JoinOption[] = joinOptions;
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;

  tableDataSource = (params: any) => {
    const columnsForApi = (this.tableColumns || []).filter((c) => c.field !== '_actions');
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/RequestClaims`, {
      page: params.page || 1,
      limit: params.limit || 10,
      offset: ((params.page || 1) - 1) * (params.limit || 10),
      search: params.search || undefined,
      searchLogic: params.searchLogic || 'AND',
      sort: params.sort,
      join: params.join,
      showDeleted: params.showDeleted,
      columns: columnsForApi.length ? columnsForApi : baseTableColumns
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading request claims:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  get tableToolbarConfig(): ToolbarConfig {
    return { items: [], show: { reload: true, columns: true, search: true, add: false, edit: false, delete: false, save: false } };
  }

  onSave = (data: any, isEdit: boolean): Observable<any> => {
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/RequestClaims/form`;
    const recid = data.Id || data.recid || null;
    const { Id, recid: _, ...record } = data;
    return this.http.post(url, {
      request: { action: 'save', recid: recid, name: isEdit ? 'EditRequestClaim' : 'AddRequestClaim', record: record }
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
    private dialog: MatDialog
  ) {}

  ngAfterViewInit(): void {
    this.buildTableColumns();
  }

  private buildTableColumns(): void {
    if (!this.actionsCellRef) {
      this.tableColumns = [...baseTableColumns];
      this.cdr.detectChanges();
      return;
    }
    const actionsColumn: TableColumn = {
      field: '_actions',
      label: 'İşlemler',
      text: 'İşlemler',
      sortable: false,
      width: '160px',
      size: '160px',
      searchable: false,
      resizable: false,
      template: this.actionsCellRef
    };
    this.tableColumns = [...baseTableColumns, actionsColumn];
    this.cdr.detectChanges();
  }

  /** Talep henüz onaylanmamış ve reddedilmemişse true */
  isRequestPending(row: any): boolean {
    if (!row) return false;
    const approved = row.ApprovedAt ?? row.approvedAt;
    const rejected = row.RejectedAt ?? row.rejectedAt;
    return !approved && !rejected;
  }

  openApproveDialog(row: any): void {
    const dialogRef = this.dialog.open(RequestClaimActionDialogComponent, {
      width: '520px',
      data: { mode: 'approve', record: row }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true && this.dataTableComponent) {
        this.dataTableComponent.reload();
      }
    });
  }

  openRejectDialog(row: any): void {
    const dialogRef = this.dialog.open(RequestClaimActionDialogComponent, {
      width: '520px',
      data: { mode: 'reject', record: row }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true && this.dataTableComponent) {
        this.dataTableComponent.reload();
      }
    });
  }

  ngOnInit(): void {}
  onTableRowClick(event: any): void {}
  onTableRowDblClick(event: any): void {}
  onTableRowSelect(event: any): void {}
  onTableRefresh(): void {
    if (!this.isReloading && this.dataTableComponent) {
      this.isReloading = true;
      setTimeout(() => { this.isReloading = false; }, 1000);
    }
  }

  onTableDelete(_event: any): void {}
  onTableAdd(): void {}
  onTableEdit(_event: any): void {}
  onAdvancedFilterChange(event: any): void {}
}
