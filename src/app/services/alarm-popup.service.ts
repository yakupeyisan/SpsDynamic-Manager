import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

/** WebSocket'ten gelen isPopUp=true alarm mesajı (ham payload + meta) */
export interface AlarmPopupItem {
  id: string;
  receivedAt: Date;
  /** WS'ten gelen ham alarm event / mesaj */
  payload: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root'
})
export class AlarmPopupService {
  private listSubject = new BehaviorSubject<AlarmPopupItem[]>([]);
  public list$ = this.listSubject.asObservable();

  get list(): AlarmPopupItem[] {
    return this.listSubject.value;
  }

  get count(): number {
    return this.listSubject.value.length;
  }

  /** Liste başlığı (kısa): AlarmTime veya SourceName/Description */
  getItemTitle(item: AlarmPopupItem): string {
    const p = item.payload;
    const time = p['AlarmTime'] ? formatDateTime(p['AlarmTime']) : item.receivedAt.toLocaleTimeString('tr-TR');
    const source = (p['SourceName'] || p['SourceType'] || '') as string;
    const desc = (p['Description'] || '') as string;
    const part = [source, desc].filter(Boolean).join(' – ');
    return part ? `${time} – ${part}` : `Alarm – ${time}`;
  }

  add(payload: Record<string, unknown>): void {
    if (!payload) return;
    const id = `alarm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const item: AlarmPopupItem = {
      id,
      receivedAt: new Date(),
      payload: { ...payload }
    };
    this.listSubject.next([item, ...this.listSubject.value]);
  }

  remove(id: string): void {
    this.listSubject.next(this.listSubject.value.filter(m => m.id !== id));
  }

  /** Verilen AlarmEventID'lere ait bildirimleri listeden kaldırır (sayfa üzerinden onaylandığında kullanılır) */
  removeByAlarmEventIds(alarmEventIds: (number | string)[]): void {
    if (!alarmEventIds?.length) return;
    const idSet = new Set(alarmEventIds.map(id => (typeof id === 'string' ? parseInt(id, 10) : id)));
    this.listSubject.next(
      this.listSubject.value.filter(item => {
        const payloadId = item.payload['AlarmEventID'];
        const num = payloadId != null ? (typeof payloadId === 'number' ? payloadId : parseInt(String(payloadId), 10)) : NaN;
        return !(Number.isFinite(num) && idSet.has(num));
      })
    );
  }

  clear(): void {
    this.listSubject.next([]);
  }

  /** Alarm onaylandığında emit edilir; AlarmsView/AllView açıksa grid yenilensin diye dinlenir */
  private alarmApprovedSubject = new Subject<void>();
  public alarmApproved$ = this.alarmApprovedSubject.asObservable();

  notifyAlarmApproved(): void {
    this.alarmApprovedSubject.next();
  }
}

function formatDateTime(value: unknown): string {
  if (value == null) return '';
  const d = typeof value === 'string' ? new Date(value) : new Date(Number(value));
  return isNaN(d.getTime()) ? String(value) : d.toLocaleString('tr-TR');
}
