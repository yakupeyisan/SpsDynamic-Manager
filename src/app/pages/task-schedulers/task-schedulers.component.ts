// TaskSchedulers Component
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
import { joinOptions } from './task-schedulers-config';
import { tableColumns } from './task-schedulers-table-columns';
import { formFields as baseFormFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './task-schedulers-form-config';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, JoinOption, FormTab } from 'src/app/components/data-table/data-table.component';

type RepeatType = 'Daily' | 'Weekly' | 'Monthly' | 'OneTime' | string;
type MonthlyType = 'Daily' | 'Time' | string;
type SchedulerType = 'Report' | 'Trigger' | string;

@Component({
  selector: 'app-task-schedulers',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule, DataTableComponent],
  templateUrl: './task-schedulers.component.html',
  styleUrls: ['./task-schedulers.component.scss'],
})
export class TaskSchedulersComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  private isReloading: boolean = false;

  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;

  // Clone formFields so we can toggle disabled flags at runtime
  formFields: TableColumn[] = baseFormFields.map((f) => ({ ...f, load: f.load, options: f.options }));
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = (apiRecord: any) => {
    const mapped = formDataMapper(apiRecord);

    // Seed snapshot from mapped data and apply rules immediately on edit load,
    // so edit form doesn't stay stuck with initial disabled fields.
    this.currentFormData = { ...mapped };
    const repeatType = this.currentFormData?.RepeatType as RepeatType;
    this.applyRepeatTypeRules(repeatType);
    if (repeatType === 'Monthly') {
      this.applyMonthlyTypeRules(this.currentFormData?.MonthlyType as MonthlyType);
    }
    this.applySchedulerTypeRules(this.currentFormData?.Type as SchedulerType);

    return mapped;
  };

  private currentFormData: any = {};

  tableDataSource = (params: any): Observable<GridResponse> => {
    return this.http
      .post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/TaskSchedulers`, {
        page: params.page || 1,
        limit: params.limit || 100,
        offset: ((params.page || 1) - 1) * (params.limit || 100),
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
          console.error('Error loading task schedulers:', error);
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
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/TaskSchedulers/form`;
    const recid = data.Id || data.ID || data.recid || null;
    const { Id, ID, recid: _, ...record } = data;

    return this.http
      .post(url, {
        request: {
          action: 'save',
          recid: recid,
          name: isEdit ? 'EditTaskScheduler' : 'AddTaskScheduler',
          record: record,
        },
      })
      .pipe(
        map((response: any) => {
          if (response?.error === false || response?.status === 'success') {
            this.toastr.success(this.translate.instant('common.saveSuccess'), this.translate.instant('common.success'));
            return { error: false, record: response.record || response };
          } else {
            this.toastr.error(response?.message || this.translate.instant('common.saveError'), this.translate.instant('common.error'));
            return { error: true, message: response?.message || this.translate.instant('common.saveError') };
          }
        }),
        catchError((error) => {
          console.error('Save error:', error);
          this.toastr.error(this.translate.instant('common.saveError'), this.translate.instant('common.error'));
          return of({ error: true, message: error?.message || this.translate.instant('common.saveError') });
        })
      );
  };

  onFormChange = (patch: any) => {
    // Keep a merged snapshot so we can apply multi-field rules correctly
    this.currentFormData = { ...this.currentFormData, ...patch };

    // Apply old w2ui-like enable/disable rules
    const repeatType = this.currentFormData?.RepeatType as RepeatType;
    this.applyRepeatTypeRules(repeatType);
    // MonthlyType rules should only apply when RepeatType is Monthly
    if (repeatType === 'Monthly') {
      this.applyMonthlyTypeRules(this.currentFormData?.MonthlyType as MonthlyType);
    }
    this.applySchedulerTypeRules(this.currentFormData?.Type as SchedulerType);
  };

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  private setDisabled(fields: string[], disabled: boolean): void {
    let changed = false;
    this.formFields = this.formFields.map((f) => {
      if (!fields.includes(f.field)) return f;
      if ((f.disabled ?? false) === disabled) return f;
      changed = true;
      return { ...f, disabled };
    });

    if (changed) {
      // Push new reference into DataTable input
      this.cdr.markForCheck();
    }
  }

  private applyRepeatTypeRules(repeatType: RepeatType): void {
    const fieldsToDisable = ['EventDateTime', 'EventTime', 'PerDay', 'MonthlyType', 'DayOfMonth', 'DayOfWeek', 'WeekOfMonth', 'MonthOfYear'];
    this.setDisabled(fieldsToDisable, true);

    if (repeatType === 'Daily') {
      this.setDisabled(['EventTime', 'PerDay'], false);
    } else if (repeatType === 'Weekly') {
      this.setDisabled(['EventTime', 'DayOfWeek'], false);
    } else if (repeatType === 'Monthly') {
      this.setDisabled(['MonthOfYear', 'MonthlyType', 'EventTime'], false);
      // MonthlyType rule will further toggle DayOfMonth/WeekOfMonth/DayOfWeek
    } else if (repeatType === 'OneTime') {
      this.setDisabled(['EventDateTime', 'EventTime'], false);
    }
  }

  private applyMonthlyTypeRules(monthlyType: MonthlyType): void {
    // Only meaningful when repeatType is Monthly; but safe to run always
    this.setDisabled(['DayOfMonth', 'DayOfWeek', 'WeekOfMonth'], true);

    if (monthlyType === 'Daily') {
      this.setDisabled(['DayOfMonth'], false);
    } else if (monthlyType === 'Time') {
      this.setDisabled(['DayOfWeek', 'WeekOfMonth'], false);
    }
  }

  private applySchedulerTypeRules(type: SchedulerType): void {
    this.setDisabled(['Url', 'ReportTaskId'], true);

    if (type === 'Report') {
      this.setDisabled(['ReportTaskId'], false);
    } else if (type === 'Trigger') {
      this.setDisabled(['Url'], false);
    }
  }

  onTableRefresh(): void {
    if (!this.isReloading && this.dataTableComponent) {
      this.isReloading = true;
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
      const id = row.Id || row.ID || row.recid || row.id;
      if (id !== null && id !== undefined) selectedIds.push(Number(id));
    });

    if (selectedIds.length === 0) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/TaskSchedulers/delete`, { request: { action: 'delete', recid: selectedIds } }).subscribe({
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

  onTableAdd(): void {
    // Reset local snapshot so rules start clean
    this.currentFormData = {};
    this.applyRepeatTypeRules('');
    this.applySchedulerTypeRules('');
    this.dataTableComponent?.openAddForm();
  }

  onTableEdit(event: any): void {
    if (event && (event.selectedRecord || event.Id || event.ID)) {
      const record = event.selectedRecord || event;
      // Seed snapshot for correct initial enable/disable
      this.currentFormData = { ...record };
      const repeatType = this.currentFormData?.RepeatType as RepeatType;
      this.applyRepeatTypeRules(repeatType);
      if (repeatType === 'Monthly') {
        this.applyMonthlyTypeRules(this.currentFormData?.MonthlyType as MonthlyType);
      }
      this.applySchedulerTypeRules(this.currentFormData?.Type as SchedulerType);
      this.dataTableComponent?.openEditForm(record);
    }
  }
}

