// AlarmsView Component - Alarm olaylarını listeleme (AlarmEvent)
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { tableColumns } from './alarms-view-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './alarms-view-form-config';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, FormTab, TableRow } from 'src/app/components/data-table/data-table.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { WebSocketService } from 'src/app/services/websocket.service';
import { AlarmPopupService } from 'src/app/services/alarm-popup.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-alarms-view',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule,
    TablerIconsModule,
    TranslateModule,
    DataTableComponent,
    ModalComponent
  ],
  templateUrl: './alarms-view.component.html',
  styleUrls: ['./alarms-view.component.scss']
})
export class AlarmsViewComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  private isReloading = false;
  private wsMessagesSub?: Subscription;
  private alarmApprovedSub?: Subscription;

  /** Toplu onay modalı */
  showBulkApproveModal = false;
  bulkApproveNote = '';
  isApproving = false;
  /** Grid'den seçilen alarm kayıtları (rowSelect ile güncellenir) */
  selectedAlarmRows: TableRow[] = [];

  tableColumns: TableColumn[] = tableColumns;
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;

  tableDataSource = (params: any): Observable<GridResponse> => {
    const baseUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    return this.http
      .post<GridResponse>(`${baseUrl}/api/AlarmEvents`, {
        page: params.page || 1,
        limit: params.limit || 100,
        offset: ((params.page || 1) - 1) * (params.limit || 100),
        search: params.search || undefined,
        searchLogic: params.searchLogic || 'AND',
        sort: params.sort,
        join: params.join,
        showDeleted: params.showDeleted,
        columns: this.tableColumns
      })
      .pipe(
        map((response: GridResponse) => ({
          status: 'success' as const,
          total: response.total ?? (response.records ? response.records.length : 0),
          records: response.records ?? []
        })),
        catchError((error) => {
          console.error('Error loading alarm events:', error);
          return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
        })
      );
  };

  get tableToolbarConfig(): ToolbarConfig {
    return {
      items: [
        {
          id: 'bulk-approve',
          type: 'button',
          text: 'Onayla',
          icon: 'check',
          tooltip: 'Seçili alarmları onayla',
          onClick: (event: MouseEvent, item: any) => this.onBulkApprove(event, item)
        }
      ],
      show: { reload: true, columns: true, search: true, add: false, edit: false, delete: false, save: false }
    };
  }

  onSave = (_data: any, _isEdit: boolean): Observable<any> =>
    of({ error: true, message: 'Alarm kayıtları sadece görüntüleme amaçlıdır.' });

  onFormChange = (_formData: any): void => {};

  /** Alarm satırına Color alanına göre arka plan rengi uygula */
  getAlarmRowStyle = (row: TableRow): { [key: string]: string } | null => {
    const color = row?.['Color'];
    if (typeof color !== 'string' || !color.trim()) return null;
    const hex = color.trim();
    if (!/^#?[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(hex)) return null;
    return { 'background-color': hex.startsWith('#') ? hex : `#${hex}` };
  };

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private ws: WebSocketService,
    private alarmPopupService: AlarmPopupService
  ) {}

  ngOnInit(): void {
    this.connectToAllAlarms();
    this.wsMessagesSub = this.ws.getMessages().subscribe((data: Record<string, unknown>) => {
      if (!this.isAlarmEventMessage(data)) return;
      const id = this.getAlarmEventId(data);
      if (id != null && this.dataTableComponent?.hasRecordWithRecid(id)) return;
      const record = this.normalizeAlarmEventRecord(data);
      this.dataTableComponent?.prependRecordsToInternal(record);
      this.cdr.markForCheck();
    });
    this.alarmApprovedSub = this.alarmPopupService.alarmApproved$.subscribe(() => {
      this.dataTableComponent?.reload();
      this.cdr.markForCheck();
    });
  }

  /** Sayfa açıldığında tüm alarmlara otomatik bağlan */
  private connectToAllAlarms(): void {
    const baseUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    this.http
      .post<GridResponse>(`${baseUrl}/api/Alarms`, {
        page: 1,
        limit: 10000,
        offset: 0,
        showDeleted: false,
        columns: [{ field: 'AlarmID' }]
      })
      .pipe(
        map((res: GridResponse) => (res.records ?? []).map((r: any) => r.AlarmID ?? r.recid ?? r.id).filter((id: any) => id != null)),
        catchError(() => of([]))
      )
      .subscribe((alarmIds: number[]) => {
        if (alarmIds.length > 0) {
          this.ws.sendMessage({ type: 'alarmconnect', alarmList: alarmIds }).catch(() => {});
        }
      });
  }

  ngOnDestroy(): void {
    this.wsMessagesSub?.unsubscribe();
    this.alarmApprovedSub?.unsubscribe();
  }

  private isAlarmEventMessage(data: unknown): data is Record<string, unknown> {
    return typeof data === 'object' && data !== null && 'AlarmEventID' in data;
  }

  private getAlarmEventId(data: Record<string, unknown>): number | null {
    const v = data['AlarmEventID'];
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    if (typeof v === 'string') {
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    }
    return null;
  }

  private normalizeAlarmEventRecord(data: Record<string, unknown>): TableRow {
    const rec: TableRow = { ...data } as TableRow;
    if (rec['recid'] == null && rec['AlarmEventID'] != null) {
      rec['recid'] = rec['AlarmEventID'];
    }
    return rec;
  }

  onTableRowClick(_event: any): void {}
  onTableRowDblClick(_event: any): void {}
  onTableRowSelect(rows: TableRow[]): void {
    this.selectedAlarmRows = rows || [];
  }

  /** Seçili satırlar içinde henüz onaylanmamış olanlar (ApprovedTime null) */
  get pendingApprovalRows(): TableRow[] {
    if (!this.selectedAlarmRows || this.selectedAlarmRows.length === 0) return [];
    return this.selectedAlarmRows.filter((row: TableRow) => row['ApprovedTime'] == null);
  }

  onBulkApprove(_event: MouseEvent, _item: any): void {
    if (!this.selectedAlarmRows || this.selectedAlarmRows.length === 0) {
      this.toastr.warning('Onaylamak için en az bir alarm seçin.', 'Uyarı');
      return;
    }
    const pending = this.pendingApprovalRows;
    if (pending.length === 0) {
      this.toastr.warning('Seçili kayıtlar zaten onaylı. Onaylanmamış alarm seçin.', 'Uyarı');
      return;
    }
    this.bulkApproveNote = '';
    this.showBulkApproveModal = true;
  }

  onBulkApproveModalChange(show: boolean): void {
    if (!show) this.closeBulkApproveModal();
  }

  closeBulkApproveModal(): void {
    this.showBulkApproveModal = false;
    this.bulkApproveNote = '';
  }

  onConfirmBulkApprove(): void {
    const pending = this.pendingApprovalRows;
    if (!pending || pending.length === 0) return;
    const baseUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    const note = (this.bulkApproveNote || '').trim() || undefined;
    const requests = pending
      .map((row: TableRow) => {
        const id = row['AlarmEventID'] ?? row['recid'] ?? row['id'];
        return id != null ? this.http.post(`${baseUrl}/api/AlarmEvents/Approve`, { AlarmEventID: id, ApprovedNote: note }) : null;
      })
      .filter((r) => r != null) as Observable<object>[];
    if (requests.length === 0) return;
    this.isApproving = true;
    this.cdr.markForCheck();
    forkJoin(requests).subscribe({
      next: () => {
        const approvedIds: (number | string)[] = pending
          .map((row: TableRow) => row['AlarmEventID'] ?? row['recid'] ?? row['id'])
          .filter((id: unknown): id is number | string => id != null && (typeof id === 'number' || typeof id === 'string'));
        this.alarmPopupService.removeByAlarmEventIds(approvedIds);
        this.alarmPopupService.notifyAlarmApproved();
        this.isApproving = false;
        this.closeBulkApproveModal();
        this.dataTableComponent?.reload();
        this.cdr.markForCheck();
        this.toastr.success(`${requests.length} alarm onaylandı.`, 'Başarılı');
      },
      error: () => {
        this.isApproving = false;
        this.cdr.markForCheck();
        this.toastr.error('Onaylama sırasında hata oluştu.', 'Hata');
      }
    });
  }

  onTableRefresh(): void {
    if (!this.isReloading && this.dataTableComponent) {
      this.isReloading = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.isReloading = false;
        this.cdr.markForCheck();
      }, 800);
    }
  }

  onTableDelete(_event: any): void {}
  onTableAdd(): void {}
  onTableEdit(_event: any): void {}
  onAdvancedFilterChange(_event: any): void {}
}
