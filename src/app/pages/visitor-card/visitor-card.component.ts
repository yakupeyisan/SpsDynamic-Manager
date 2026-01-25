// VisitorCard Component
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

import { joinOptions } from './visitor-card-config';
import { tableColumns } from './visitor-card-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './visitor-card-form-config';

import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, JoinOption, FormTab } from 'src/app/components/data-table/data-table.component';

@Component({
  selector: 'app-visitor-card',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule, DataTableComponent],
  templateUrl: './visitor-card.component.html',
  styleUrls: ['./visitor-card.component.scss'],
})
export class VisitorCardComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;

  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;

  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;

  enableReportSave: boolean = true;
  reportConfig = {
    grid: 'VisitorCardGrid',
    url: `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/VisitorCards`,
  };

  tableDataSource = (params: any): Observable<GridResponse> => {
    return this.http
      .post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/VisitorCards`, {
        page: params.page || 1,
        limit: params.limit || 10,
        offset: ((params.page || 1) - 1) * (params.limit || 10),
        search: params.search || undefined,
        searchLogic: params.searchLogic || 'AND',
        sort: params.sort,
        join: params.join,
        showDeleted: params.showDeleted,
        columns: this.tableColumns,
      })
      .pipe(
        map((response: GridResponse) => ({
          status: 'success' as const,
          total: response.total || (response.records ? response.records.length : 0),
          records: response.records || [],
        })),
        catchError((error) => {
          console.error('Error loading visitor cards:', error);
          return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
        })
      );
  };

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
        save: false,
      },
    };
  }

  onSave = (data: any, isEdit: boolean): Observable<any> => {
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/VisitorCards/save`;
    const recid = data.CardID || data.recid || null;
    const { CardID, recid: _, ...record } = data;

    // Force visitor flag for this screen
    (record as any).isVisitor = true;

    return this.http
      .post(url, {
        request: {
          action: 'save',
          recid: recid,
          name: isEdit ? 'EditCard' : 'AddCard',
          record: record,
        },
      })
      .pipe(
        map((response: any) => {
          if (response?.error === false || response?.status === 'success') {
            this.toastr.success(this.translate.instant('common.saveSuccess') || 'Kayıt başarıyla kaydedildi', this.translate.instant('common.success') || 'Başarılı');
            return { error: false, record: response.record || response };
          } else {
            this.toastr.error(response?.message || this.translate.instant('common.saveError') || 'Kayıt kaydedilemedi', this.translate.instant('common.error') || 'Hata');
            return { error: true, message: response?.message || this.translate.instant('common.saveError') || 'Kayıt kaydedilemedi' };
          }
        }),
        catchError((error) => {
          console.error('Save error:', error);
          this.toastr.error(this.translate.instant('common.saveError') || 'Kayıt kaydedilemedi', this.translate.instant('common.error') || 'Hata');
          return of({ error: true, message: error?.message || this.translate.instant('common.saveError') || 'Kayıt kaydedilemedi' });
        })
      );
  };

  onFormChange = (_formData: any) => {
    // Keep CardStatusId forced to "Ziyaretçi Kartı" in both add & edit.
    this.applyVisitorCardStatusDefault();
  };

  private setCardStatusDisabled(disabled: boolean): void {
    const statusField = this.formFields.find((f) => f.field === 'CardStatusId');
    if (statusField) {
      statusField.disabled = disabled;
      this.cdr.markForCheck();
    }
  }

  private findVisitorCardStatusId(): number | null {
    const statusField = this.formFields.find((f) => f.field === 'CardStatusId');
    const options: any[] = Array.isArray((statusField as any)?.options) ? (statusField as any).options : [];
    if (!options.length) return null;

    const match = options.find((o: any) => {
      const label = String(o?.label ?? o?.text ?? '').toLowerCase();
      return label === 'ziyaretçi kartı' || label === 'ziyaretci karti' || label.includes('ziyaretçi') || label.includes('ziyaretci');
    });

    const val = match?.value ?? match?.id ?? null;
    if (val == null) return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  }

  private applyVisitorCardStatusDefault(): void {
    // Always disabled (both add & edit)
    this.setCardStatusDisabled(true);

    const trySet = (attempt: number) => {
      if (!this.dataTableComponent) return;
      const dt: any = this.dataTableComponent as any;
      if (!dt.formData) return;

      const desiredId = this.findVisitorCardStatusId();
      if (desiredId != null) {
        dt.formData.CardStatusId = desiredId;
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

  ngOnInit(): void {}

  onTableRowClick(_event: any): void {}
  onTableRowDblClick(_event: any): void {}
  onTableRowSelect(_event: any): void {}
  onTableRefresh(): void {}
  onAdvancedFilterChange(_event: any): void {}

  onTableAdd(): void {
    // Add mode: force CardStatusId to "Ziyaretçi Kartı" and keep disabled
    this.applyVisitorCardStatusDefault();
  }

  onTableEdit(_event: any): void {
    // Edit mode: still forced + disabled
    this.applyVisitorCardStatusDefault();
  }

  onTableDelete(_event: any): void {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }

    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen silmek için en az bir kayıt seçiniz.');
      return;
    }

    const selectedIds: number[] = [];
    selectedRows.forEach((row: any) => {
      const cardId = row.CardID || row.recid;
      if (cardId) selectedIds.push(Number(cardId));
    });

    if (selectedIds.length === 0) {
      this.toastr.warning('Geçerli kayıt seçilmedi.');
      return;
    }

    if (!confirm(`${selectedIds.length} kayıt silinecek. Emin misiniz?`)) {
      return;
    }

    this.http
      .post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/VisitorCards/delete`, { Selecteds: selectedIds })
      .subscribe({
        next: (response: any) => {
          if (response?.error === false || response?.status === 'success') {
            this.toastr.success(this.translate.instant('common.deleteSuccess') || 'Kayıt(lar) başarıyla silindi', this.translate.instant('common.success') || 'Başarılı');
            this.dataTableComponent?.reload();
          } else {
            this.toastr.error(response?.message || this.translate.instant('common.deleteError') || 'Kayıt(lar) silinemedi', this.translate.instant('common.error') || 'Hata');
          }
        },
        error: (error) => {
          console.error('Error deleting visitor cards:', error);
          const errorMessage = error?.error?.message || error?.message || this.translate.instant('common.deleteError') || 'Kayıt(lar) silinemedi';
          this.toastr.error(errorMessage, this.translate.instant('common.error') || 'Hata');
        },
      });
  }
}

