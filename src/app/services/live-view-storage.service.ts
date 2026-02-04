import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WebSocketService } from './websocket.service';
import { ToastrService } from 'ngx-toastr';

/** Maximum number of live view records to keep in storage (oldest are dropped). */
const MAX_STORED_RECORDS = 100;

/**
 * Service that stores live view WebSocket messages in the background.
 * When live view is active, messages are stored even if the user navigates away.
 * Stored records are available when the user returns to the live view page.
 */
@Injectable({
  providedIn: 'root'
})
export class LiveViewStorageService {
  private storedRecords: any[] = [];
  private storedRecords$ = new BehaviorSubject<any[]>([]);
  private isActive = false;
  private isActive$ = new BehaviorSubject<boolean>(false);
  private recordCount = 1;
  private wsSubscription: any;
  private connectionStatusSubscription: any;
  private currentReaderList: number[] = [];

  constructor(
    private wsService: WebSocketService,
    private toastr: ToastrService
  ) {}

  /**
   * Start live view: send clientconnect and store incoming 'live' messages.
   * Continues storing in background even when user leaves the live view page.
   */
  startLiveView(readerList: number[]): void {
    if (readerList.length === 0) {
      return;
    }

    this.currentReaderList = [...readerList];
    this.wsService.sendMessage({
      type: 'clientconnect',
      readerList: this.currentReaderList
    });

    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.connectionStatusSubscription) {
      this.connectionStatusSubscription.unsubscribe();
    }

    this.isActive = true;
    this.isActive$.next(true);

    this.wsSubscription = this.wsService.getMessages().subscribe((data: any) => {
      if (data?.Type !== 'live' || !data?.Data) return;

      const d = data.Data;
      const message = data.Status === false ? (data.Message || '') : (d.Message || '');
      const record: any = {
        ...d,
        Id: this.recordCount++,
        Message: message,
        LiveStatus: data.Status
      };

      this.storedRecords.unshift(record);
      if (this.storedRecords.length > MAX_STORED_RECORDS) {
        this.storedRecords = this.storedRecords.slice(0, MAX_STORED_RECORDS);
      }
      this.storedRecords$.next([...this.storedRecords]);
    });

    this.connectionStatusSubscription = this.wsService.getConnectionStatus().subscribe((connected: boolean) => {
      if (!connected && this.isActive) {
        this.isActive = false;
        this.isActive$.next(false);
        this.stopLiveViewSubscriptions();
        this.toastr.warning('WebSocket bağlantısı kesildi. Canlı izleme durduruldu.', 'Bağlantı Hatası');
      }
    });
  }

  /**
   * Stop live view: stop subscribing to new messages. Stored records are kept.
   */
  stopLiveView(): void {
    this.isActive = false;
    this.isActive$.next(false);
    this.stopLiveViewSubscriptions();
  }

  private stopLiveViewSubscriptions(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
      this.wsSubscription = undefined;
    }
    if (this.connectionStatusSubscription) {
      this.connectionStatusSubscription.unsubscribe();
      this.connectionStatusSubscription = undefined;
    }
  }

  /** Get current stored records (copy). */
  getStoredRecords(): any[] {
    return [...this.storedRecords];
  }

  /** Observable of stored records; emits when new records are added. */
  getStoredRecords$() {
    return this.storedRecords$.asObservable();
  }

  /** Whether live view is currently active (storing messages). */
  getIsActive(): boolean {
    return this.isActive;
  }

  /** Observable of active state. */
  getIsActive$() {
    return this.isActive$.asObservable();
  }

  /** Current reader list used for live view. */
  getCurrentReaderList(): number[] {
    return [...this.currentReaderList];
  }

  /**
   * Clear stored records (optional; e.g. user action "Temizle").
   * Does not stop live view if active.
   */
  clearStoredRecords(): void {
    this.storedRecords = [];
    this.storedRecords$.next([]);
  }
}
