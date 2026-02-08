// AllView - Geçiş ve Alarmları aynı anda izleme
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
import { tableColumns as accessTableColumns } from '../live-view/live-view-table-columns';
import { tableColumns as alarmTableColumns } from '../alarms-view/alarms-view-table-columns';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, TableRow, ColumnType } from 'src/app/components/data-table/data-table.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { SelectComponent } from 'src/app/components/select/select.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { WebSocketService } from 'src/app/services/websocket.service';
import { LiveViewStorageService } from 'src/app/services/live-view-storage.service';
import { AlarmPopupService } from 'src/app/services/alarm-popup.service';

@Component({
  selector: 'app-all-view',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule,
    TablerIconsModule,
    TranslateModule,
    DataTableComponent,
    ModalComponent,
    SelectComponent,
    ButtonComponent
  ],
  templateUrl: './all-view.component.html',
  styleUrls: ['./all-view.component.scss']
})
export class AllViewComponent implements OnInit, OnDestroy {
  @ViewChild('accessGrid') accessGridComponent?: DataTableComponent;
  @ViewChild('alarmGrid') alarmGridComponent?: DataTableComponent;

  private wsMessagesSub?: Subscription;
  private accessRecordsSub?: Subscription;
  private alarmApprovedSub?: Subscription;
  private reloadThrottleMs = 200;
  private lastAccessReloadAt = 0;
  private pendingAccessReloadId: ReturnType<typeof setTimeout> | null = null;

  showConnectForm = true;
  loadingSettings = false;
  connecting = false;

  selectedLiveViewSettingId: number | null = null;
  selectedTerminals: any[] = [];
  liveViewSettings: { label: string; value: number }[] = [];

  accessTableColumns: TableColumn[] = accessTableColumns;
  alarmTableColumns: TableColumn[] = alarmTableColumns;

  terminalsTableColumns: TableColumn[] = [
    { field: 'ReaderID', label: 'ID', text: 'ID', type: 'int' as ColumnType, sortable: true, width: '80px', size: '80px', searchable: 'int', resizable: true },
    { field: 'SerialNumber', label: 'Seri Numarası', text: 'Seri Numarası', type: 'text' as ColumnType, sortable: true, width: '150px', size: '150px', searchable: 'text', resizable: true },
    { field: 'ReaderName', label: 'Terminal Adı', text: 'Terminal Adı', type: 'text' as ColumnType, sortable: true, width: '300px', size: '300px', searchable: 'text', resizable: true },
    { field: 'IpAddress', label: 'IP Adresi', text: 'IP Adresi', type: 'text' as ColumnType, sortable: true, width: '150px', size: '150px', searchable: 'text', resizable: true }
  ];

  accessRecords: any[] = [];
  currentReaderList: number[] = [];

  showFilterModal = false;
  showRowSizeModal = false;
  accessRecordHeight = 100;
  newRowSize = 100;

  /** Ekran yüksekliğinin yarısı kadar grid alanı (toolbar/padding için pay bırakılır) */
  accessGridHeight = 'calc(50vh - 356px)';
  alarmGridHeight = 'calc(50vh - 356px)';

  accessDataSource = (params: any): Observable<GridResponse> =>
    of({
      status: 'success' as const,
      total: this.accessRecords.length,
      records: this.accessRecords
    } as GridResponse);

  alarmDataSource = (params: any): Observable<GridResponse> => {
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
        columns: this.alarmTableColumns
      })
      .pipe(
        map((res: GridResponse) => ({
          status: 'success' as const,
          total: res.total ?? (res.records ? res.records.length : 0),
          records: res.records ?? []
        })),
        catchError(() => of({ status: 'error' as const, total: 0, records: [] } as GridResponse))
      );
  };

  get accessToolbarConfig(): ToolbarConfig {
    return {
      items: [
        { type: 'break' as const, id: 'break-operations' },
        {
          id: 'recordSize',
          type: 'button' as const,
          text: 'Satır Yüksekliği',
          tooltip: 'Satır yüksekliğini değiştir',
          onClick: (event: MouseEvent, item: any) => this.onSetRowSize(event, item)
        },
        {
          id: 'filterRecord',
          type: 'button' as const,
          text: 'Filtrele',
          tooltip: 'Terminal gruplarını seç',
          onClick: (event: MouseEvent, item: any) => this.onFilterByGroup(event, item)
        }
      ],
      show: { reload: true, columns: true, search: true, add: false, edit: false, delete: false, save: false }
    };
  }

  get alarmToolbarConfig(): ToolbarConfig {
    return {
      items: [],
      show: { reload: true, columns: true, search: true, add: false, edit: false, delete: false, save: false }
    };
  }

  /** Geçiş kaydında Status false ise (reddedildi) satır arka planı kırmızı */
  getAccessRowStyle = (row: TableRow): { [key: string]: string } | null => {
    if (row?.['LiveStatus'] === false) return { 'background-color': '#ef4444', color: '#fff' };
    return null;
  };

  /** Alarm satırına Color alanına göre arka plan rengi uygula */
  getAlarmRowStyle = (row: TableRow): { [key: string]: string } | null => {
    const color = row?.['Color'];
    if (typeof color !== 'string' || !color.trim()) return null;
    const hex = color.trim();
    if (!/^#?[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(hex)) return null;
    return { 'background-color': hex.startsWith('#') ? hex : `#${hex}` };
  };

  terminalsDataSource = (params: any): Observable<GridResponse> =>
    of({ status: 'success' as const, total: this.selectedTerminals.length, records: this.selectedTerminals } as GridResponse);

  get terminalsTableToolbarConfig(): ToolbarConfig {
    return {
      items: [],
      show: { reload: false, columns: false, search: false, add: false, edit: false, delete: false, save: false }
    };
  }

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private ws: WebSocketService,
    private liveViewStorage: LiveViewStorageService,
    private alarmPopupService: AlarmPopupService
  ) {}

  ngOnInit(): void {
    this.loadLiveViewSettings();
    this.alarmApprovedSub = this.alarmPopupService.alarmApproved$.subscribe(() => {
      this.alarmGridComponent?.reload();
      this.cdr.markForCheck();
    });
    // Geçiş grubu daha önce seçilip bağlanmışsa formu gösterme (sayfaya geri dönüldüğünde)
    const readerList = this.liveViewStorage.getCurrentReaderList();
    if (this.liveViewStorage.getIsActive() && readerList.length > 0) {
      this.showConnectForm = false;
      this.currentReaderList = readerList;
      this.subscribeAccessRecords();
      this.subscribeAlarmMessages();
    }
  }

  ngOnDestroy(): void {
    this.wsMessagesSub?.unsubscribe();
    this.accessRecordsSub?.unsubscribe();
    this.alarmApprovedSub?.unsubscribe();
    if (this.pendingAccessReloadId) clearTimeout(this.pendingAccessReloadId);
  }

  private loadLiveViewSettings(): void {
    this.loadingSettings = true;
    this.http
      .post<GridResponse>(
        `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/LiveViewSettings`,
        { limit: -1, offset: 0 }
      )
      .pipe(
        map((res: GridResponse) => {
          this.liveViewSettings = (res.records || []).map((r: any) => ({
            label: r.Name || '',
            value: r.Id ?? r.id
          }));
          return res;
        }),
        catchError(() => of({ status: 'error' as const, total: 0, records: [] } as GridResponse))
      )
      .subscribe(() => {
        this.loadingSettings = false;
        this.cdr.markForCheck();
      });
  }

  onLiveViewSettingChange(): void {
    if (!this.selectedLiveViewSettingId) {
      this.selectedTerminals = [];
      this.cdr.markForCheck();
      return;
    }
    this.http
      .post<any>(
        `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/GetSelectedByLiveViewSettingId`,
        { LiveViewSettingId: this.selectedLiveViewSettingId }
      )
      .pipe(
        map((res: any) => {
          if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
          if (res?.records && Array.isArray(res.records)) return res.records;
          if (res?.data && Array.isArray(res.data)) return res.data;
          return Array.isArray(res) ? res : [];
        }),
        catchError(() => of([]))
      )
      .subscribe((terminals: any[]) => {
        this.selectedTerminals = terminals || [];
        this.cdr.markForCheck();
      });
  }

  onConnect(): void {
    const readerList = this.selectedTerminals
      .map((t: any) => parseInt(t.SerialNumber || t.serialNumber || '0', 10))
      .filter((n: number) => !Number.isNaN(n) && n > 0);

    if (readerList.length === 0) {
      this.toastr.warning('Lütfen bir terminal grubu seçin.', 'Uyarı');
      return;
    }

    this.connecting = true;
    this.cdr.markForCheck();

    this.currentReaderList = readerList;
    this.liveViewStorage.startLiveView(readerList);
    this.subscribeAccessRecords();
    this.subscribeAlarmMessages();

    // Tüm alarmları listele ve alarmconnect'e gönder
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
          this.ws.sendMessage({ type: 'alarmconnect', alarmList: alarmIds }).catch(() => {
            this.toastr.error('Alarm bağlantısı kurulamadı.', 'Hata');
          });
        }
        this.connecting = false;
        this.showConnectForm = false;
        this.cdr.markForCheck();
        this.toastr.success('Geçiş ve alarm izleme başlatıldı.', 'Başarılı');
      });
  }

  private subscribeAccessRecords(): void {
    this.accessRecords = this.liveViewStorage.getStoredRecords();
    this.accessRecordsSub = this.liveViewStorage.getStoredRecords$().subscribe(records => {
      this.accessRecords = records;
      this.scheduleAccessGridReload();
    });
  }

  private scheduleAccessGridReload(): void {
    const now = Date.now();
    if (now - this.lastAccessReloadAt >= this.reloadThrottleMs || this.lastAccessReloadAt === 0) {
      if (this.pendingAccessReloadId) {
        clearTimeout(this.pendingAccessReloadId);
        this.pendingAccessReloadId = null;
      }
      this.lastAccessReloadAt = now;
      this.accessGridComponent?.reload();
      this.cdr.markForCheck();
    } else if (!this.pendingAccessReloadId) {
      this.pendingAccessReloadId = setTimeout(() => {
        this.pendingAccessReloadId = null;
        this.lastAccessReloadAt = Date.now();
        this.accessGridComponent?.reload();
        this.cdr.markForCheck();
      }, this.reloadThrottleMs - (now - this.lastAccessReloadAt));
    }
  }

  private subscribeAlarmMessages(): void {
    this.wsMessagesSub = this.ws.getMessages().subscribe((data: Record<string, unknown>) => {
      if (typeof data !== 'object' || data === null || !('AlarmEventID' in data)) return;
      const id = this.getAlarmEventId(data);
      if (id != null && this.alarmGridComponent?.hasRecordWithRecid(id)) return;
      const record = this.normalizeAlarmRecord(data);
      this.alarmGridComponent?.prependRecordsToInternal(record);
      this.cdr.markForCheck();
    });
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

  private normalizeAlarmRecord(data: Record<string, unknown>): TableRow {
    const rec: TableRow = { ...data } as TableRow;
    if (rec['recid'] == null && rec['AlarmEventID'] != null) rec['recid'] = rec['AlarmEventID'];
    return rec;
  }

  onAccessRefresh(): void {
    this.accessGridComponent?.reload();
  }

  onAlarmRefresh(): void {
    this.alarmGridComponent?.reload();
  }

  onAccessRowClick(_e: any): void {}
  onAccessRowDblClick(_e: any): void {}
  onAccessRowSelect(_e: any): void {}
  onAccessFilterChange(_e: any): void {}
  onAccessDelete(_e: any): void {}
  onAccessAdd(): void {}
  onAccessEdit(_e: any): void {}

  onSetRowSize(_event: MouseEvent, _item: any): void {
    this.newRowSize = this.accessRecordHeight;
    this.showRowSizeModal = true;
  }

  onApplyRowSize(): void {
    if (this.newRowSize >= 40 && this.newRowSize <= 200) {
      this.accessRecordHeight = this.newRowSize;
      this.accessGridComponent?.reload();
    }
    this.showRowSizeModal = false;
  }

  onCloseRowSizeModal(): void {
    this.showRowSizeModal = false;
  }

  onFilterByGroup(_event: MouseEvent, _item: any): void {
    this.selectedLiveViewSettingId = null;
    this.selectedTerminals = [];
    this.showFilterModal = true;
  }

  onApplyFilter(): void {
    if (!this.selectedLiveViewSettingId || this.selectedTerminals.length === 0) {
      this.toastr.warning('Lütfen bir grup seçin', 'Uyarı');
      return;
    }
    const readerList = this.selectedTerminals
      .map((t: any) => parseInt(t.SerialNumber || t.serialNumber || '0', 10))
      .filter((n: number) => !Number.isNaN(n) && n > 0);
    this.currentReaderList = readerList;
    this.liveViewStorage.startLiveView(readerList);
    this.showFilterModal = false;
    this.cdr.markForCheck();
    this.toastr.success(`${readerList.length} terminal için filtre uygulandı`, 'Başarılı');
  }

  onCloseFilterModal(): void {
    this.showFilterModal = false;
    this.selectedLiveViewSettingId = null;
    this.selectedTerminals = [];
  }

  onAlarmRowClick(_e: any): void {}
  onAlarmDelete(_e: any): void {}
  onAlarmAdd(): void {}
  onAlarmEdit(_e: any): void {}
  onAlarmFilterChange(_e: any): void {}
}
