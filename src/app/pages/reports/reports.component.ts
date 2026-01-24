// Reports (Report Templates) Component
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of, lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { joinOptions } from './reports-config';
import { tableColumns } from './reports-table-columns';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, JoinOption, TableRow, ColumnType } from 'src/app/components/data-table/data-table.component';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { InputComponent } from 'src/app/components/input/input.component';
import { SelectComponent, SelectOption } from 'src/app/components/select/select.component';
import { ButtonComponent } from 'src/app/components/button/button.component';

type ReportFieldType = 'text' | 'textarea' | 'int' | 'date' | 'datetime' | 'list' | 'enum';

interface ReportField {
  Id?: number;
  Name?: string;
  Field: string;
  Type: ReportFieldType;
  Options?: any;
  ExtendRecord?: string;
}

interface TaskFieldState {
  operator: string;
  value: any;
  values: any[];
  dateMode: 'defined' | 'notDefined';
  dateDefinedValue: 'daily' | 'weekly' | 'monthly';
  dateNotDefinedDays: number | null;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule, TablerIconsModule, TranslateModule, DataTableComponent, ModalComponent, InputComponent, SelectComponent, ButtonComponent],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  private isReloading: boolean = false;

  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;

  selectedRows: TableRow[] = [];
  selectedReport: TableRow | null = null;

  // Create task modal state
  showCreateTaskModal = false;
  isTaskModalLoading = false;
  taskName: string = '';
  taskFields: ReportField[] = [];
  taskFieldStates: TaskFieldState[] = [];

  // Minimal columns definition to help backend search/type mapping for Fields API (if available)
  private readonly fieldsApiColumns: TableColumn[] = [
    { field: 'Id', label: 'Id', type: 'int' as ColumnType, searchable: 'int' as ColumnType },
    { field: 'Name', label: 'Name', type: 'text' as ColumnType, searchable: 'text' as ColumnType },
    { field: 'Field', label: 'Field', type: 'text' as ColumnType, searchable: 'text' as ColumnType },
    { field: 'Type', label: 'Type', type: 'text' as ColumnType, searchable: 'text' as ColumnType },
  ];

  tableDataSource = (params: any): Observable<GridResponse> => {
    return this.http
      .post<GridResponse>(`${environment.apiUrl}/api/ReportTemplates`, {
        page: params.page || 1,
        limit: params.limit || 50,
        offset: ((params.page || 1) - 1) * (params.limit || 50),
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
          console.error('Error loading report templates:', error);
          return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
        })
      );
  };

  get tableToolbarConfig(): ToolbarConfig {
    return {
      items: [
        { type: 'break', id: 'break-task' },
        {
          id: 'createTask',
          type: 'button',
          text: 'Görev oluştur',
          icon: 'plus',
          tooltip: 'Seçili rapor şablonundan görev oluştur',
          onClick: () => this.openCreateTaskModal(),
        },
      ],
      show: {
        reload: true,
        columns: true,
        search: true,
        add: false,
        edit: false,
        delete: true,
        save: false,
      },
    };
  }

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  onRowSelect(rows: TableRow[]): void {
    this.selectedRows = rows || [];
    this.selectedReport = this.selectedRows.length === 1 ? this.selectedRows[0] : null;
  }

  onTableRefresh(): void {
    if (!this.isReloading && this.dataTableComponent) {
      this.isReloading = true;
      // The grid itself calls reload; we just guard rapid clicks
      setTimeout(() => {
        this.isReloading = false;
        this.cdr.markForCheck();
      }, 800);
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
      const id = row.Id ?? row.ID ?? row.recid ?? row.id;
      if (id !== null && id !== undefined) selectedIds.push(Number(id));
    });

    if (selectedIds.length === 0) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }

    this.http.post(`${environment.apiUrl}/api/ReportTemplates/delete`, { request: { action: 'delete', recid: selectedIds } }).subscribe({
      next: (response: any) => {
        if (response?.status === 'success' || response?.error === false) {
          this.toastr.success(this.translate.instant('common.deleteSuccess'), this.translate.instant('common.success'));
          this.dataTableComponent?.reload();
        } else {
          this.toastr.error(response?.message || this.translate.instant('common.deleteError'), this.translate.instant('common.error'));
        }
      },
      error: (error) => {
        console.error('Delete error:', error);
        const errorMessage = error?.error?.message || error?.message || this.translate.instant('common.deleteError');
        this.toastr.error(errorMessage, this.translate.instant('common.error'));
      },
    });
  }

  private getFieldBaseName(field: string): string {
    if (!field) return field;
    const parts = String(field).split('-');
    return parts[0] || field;
  }

  getOperatorOptionsForType(type: ReportFieldType): SelectOption[] {
    if (type === 'text' || type === 'textarea') {
      return [
        { label: 'Eşit', value: 'is' },
        { label: 'Başlayan', value: 'begins' },
        { label: 'İçeren', value: 'contains' },
        { label: 'Biten', value: 'ends' },
      ];
    }
    if (type === 'int') {
      return [
        { label: '=', value: '=' },
        { label: '<', value: '<' },
        { label: '<=', value: '<=' },
        { label: '>', value: '>' },
        { label: '>=', value: '>=' },
        { label: 'Arasında', value: 'between' },
      ];
    }
    if (type === 'list' || type === 'enum') {
      return [
        { label: 'İçeren', value: 'in' },
        { label: 'İçermeyen', value: 'not in' },
      ];
    }
    // date/datetime handled separately in UI
    return [{ label: 'Eşit', value: 'is' }];
  }

  private parseFiltersValue(raw: any): any[] | null {
    if (raw == null) return null;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private normalizeOptionsToSelectOptions(options: any): SelectOption[] {
    if (!options) return [];
    // Many backends store options as JSON with { items: [...] }
    const items = Array.isArray(options?.items) ? options.items : (Array.isArray(options) ? options : []);
    if (!Array.isArray(items)) return [];

    return items
      .map((item: any) => {
        // common shapes: {id,text} or {value,label}
        const value = item?.id ?? item?.value ?? item?.Id ?? item?.ID ?? item;
        const label = item?.text ?? item?.label ?? item?.Name ?? String(value ?? '');
        if (value == null) return null;
        return { label, value } as SelectOption;
      })
      .filter((x: SelectOption | null): x is SelectOption => x !== null);
  }

  private initTaskFieldStates(fields: ReportField[]): TaskFieldState[] {
    return fields.map((f) => {
      const type = f.Type;
      return {
        operator:
          type === 'text' || type === 'textarea'
            ? 'is'
            : type === 'int'
              ? '='
              : type === 'list' || type === 'enum'
                ? 'in'
                : 'is',
        value: '',
        values: [],
        dateMode: 'defined',
        dateDefinedValue: 'daily',
        dateNotDefinedDays: null,
      };
    });
  }

  openCreateTaskModal(): void {
    if (!this.selectedReport) {
      this.toastr.warning('Lütfen 1 adet rapor şablonu seçiniz.', this.translate.instant('common.warning'));
      return;
    }

    this.taskName = '';
    this.taskFields = [];
    this.taskFieldStates = [];
    this.showCreateTaskModal = true;
    this.isTaskModalLoading = true;

    const parsed = this.parseFiltersValue((this.selectedReport as any)?.Filters);

    // If Filters is an array of field IDs (old system), try loading field definitions
    if (parsed && parsed.length > 0 && typeof parsed[0] === 'number') {
      const ids = parsed.map((x) => Number(x)).filter((x) => !isNaN(x));
      this.loadFieldsByIds(ids).finally(() => {
        this.isTaskModalLoading = false;
        this.cdr.markForCheck();
      });
      return;
    }

    // If Filters already contains filter objects (new system), render based on those (fallback)
    if (parsed && parsed.length > 0 && typeof parsed[0] === 'object') {
      const fields: ReportField[] = parsed
        .map((x: any) => {
          const fieldName = x?.field ?? x?.Field ?? '';
          const type = (x?.type ?? x?.Type ?? 'text') as ReportFieldType;
          if (!fieldName) return null;
          return { Field: fieldName, Name: fieldName, Type: type } as ReportField;
        })
        .filter((x: ReportField | null): x is ReportField => x !== null);
      this.taskFields = fields;
      this.taskFieldStates = this.initTaskFieldStates(fields);
      this.isTaskModalLoading = false;
      this.cdr.markForCheck();
      return;
    }

    // No filters - open empty
    this.taskFields = [];
    this.taskFieldStates = [];
    this.isTaskModalLoading = false;
    this.cdr.markForCheck();
  }

  closeCreateTaskModal(): void {
    this.showCreateTaskModal = false;
    this.isTaskModalLoading = false;
    this.taskName = '';
    this.taskFields = [];
    this.taskFieldStates = [];
    this.cdr.markForCheck();
  }

  private async loadFieldsByIds(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      this.taskFields = [];
      this.taskFieldStates = [];
      return;
    }

    try {
      const resp: any = await lastValueFrom(
        this.http.post<any>(`${environment.apiUrl}/api/Fields`, {
          page: 1,
          limit: Math.max(ids.length, 100),
          offset: 0,
          search: {
            logic: 'AND',
            conditions: [
              {
                field: 'Id',
                operator: 'in',
                value: ids,
              },
            ],
          },
          searchLogic: 'AND',
          showDeleted: false,
          columns: this.fieldsApiColumns,
        })
      );

      const records: any[] = Array.isArray(resp?.records) ? resp.records : (Array.isArray(resp?.data) ? resp.data : []);

      const fields: ReportField[] = records.map((r: any) => ({
        Id: r?.Id ?? r?.ID ?? r?.id,
        Name: r?.Name ?? r?.name ?? r?.Label ?? r?.Field,
        Field: r?.Field ?? r?.field ?? '',
        Type: (r?.Type ?? r?.type ?? 'text') as ReportFieldType,
        Options: r?.Options ?? r?.options,
        ExtendRecord: r?.ExtendRecord ?? r?.extendRecord,
      })).filter((f: ReportField) => !!f.Field);

      this.taskFields = fields;
      this.taskFieldStates = this.initTaskFieldStates(fields);
    } catch (e) {
      console.error('Failed to load Fields by IDs:', e);
      // Fallback: create placeholder fields from ids
      this.taskFields = ids.map((id) => ({ Id: id, Name: `Field #${id}`, Field: `Field_${id}`, Type: 'text' as ReportFieldType }));
      this.taskFieldStates = this.initTaskFieldStates(this.taskFields);
    }
  }

  getListEnumOptions(field: ReportField): SelectOption[] {
    // Options might be stored as JSON string
    const raw = field.Options;
    let parsed: any = raw;
    if (typeof raw === 'string') {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
    }
    return this.normalizeOptionsToSelectOptions(parsed);
  }

  onDateModeChange(index: number, mode: 'defined' | 'notDefined'): void {
    this.taskFieldStates[index].dateMode = mode;
  }

  saveTask(): void {
    if (!this.selectedReport) {
      this.toastr.warning('Lütfen 1 adet rapor şablonu seçiniz.', this.translate.instant('common.warning'));
      return;
    }
    if (!this.taskName || !this.taskName.trim()) {
      this.toastr.warning('Rapor görev adı giriniz.', this.translate.instant('common.warning'));
      return;
    }

    const reportId = (this.selectedReport as any)?.Id ?? (this.selectedReport as any)?.ID ?? (this.selectedReport as any)?.id;

    const params: any[] = this.taskFields.map((f, idx) => {
      const baseField = this.getFieldBaseName(f.Field);
      const state = this.taskFieldStates[idx];

      if (f.Type === 'list' || f.Type === 'enum') {
        const valuesFromInput =
          typeof state.value === 'string' && state.value.trim()
            ? state.value.split(',').map((x) => x.trim()).filter(Boolean)
            : [];

        return {
          field: baseField,
          type: f.Type,
          operator: state.operator,
          values: Array.isArray(state.values) && state.values.length > 0 ? state.values : valuesFromInput,
        };
      }

      if (f.Type === 'date' || f.Type === 'datetime') {
        return {
          field: baseField,
          type: f.Type,
          operator: 'is',
          value: state.dateMode === 'defined' ? state.dateDefinedValue : state.dateNotDefinedDays,
        };
      }

      // text/textarea/int
      return {
        field: baseField,
        type: f.Type,
        operator: state.operator,
        value: state.value,
      };
    });

    this.isTaskModalLoading = true;

    this.http
      .post<any>(`${environment.apiUrl}/api/ReportTasks/Add`, {
        ReportId: reportId,
        Name: this.taskName.trim(),
        Params: JSON.stringify(params),
      })
      .subscribe({
        next: (res) => {
          const success = res?.success === true || res?.status === 'success' || res?.error === false;
          const message = res?.message || (success ? 'Görev oluşturuldu.' : 'Görev oluşturulamadı.');
          if (success) {
            this.toastr.success(message, this.translate.instant('common.success'));
            this.closeCreateTaskModal();
          } else {
            this.toastr.warning(message, this.translate.instant('common.warning'));
          }
        },
        error: (err) => {
          console.error('Create task error:', err);
          const msg = err?.error?.message || err?.message || 'Görev oluşturulurken hata oluştu.';
          this.toastr.error(msg, this.translate.instant('common.error'));
          this.isTaskModalLoading = false;
          this.cdr.markForCheck();
        },
      });
  }
}

