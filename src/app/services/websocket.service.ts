import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

/** Ana kanal: formatconnect, alarmconnect, checkReader, alarm popup vb. */
const WS_ENDPOINT = 'ws';
/** Canlı izleme (geçişler) kanalı: sadece clientconnect + Type==='live' mesajları */
const WS_LIVE_ENDPOINT = 'wsLive';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  /** Ana soket: /ws — formatconnect, alarmconnect, checkReader, alarm bildirimleri */
  private socket: WebSocket | null = null;
  /** Canlı izleme soketi: /wsLive — sadece geçişleri izleme (clientconnect + live mesajları) */
  private socketLive: WebSocket | null = null;

  private messageSubject = new Subject<any>();
  private messageLiveSubject = new Subject<any>();
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private connectionStatusLive = new BehaviorSubject<boolean>(false);

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private isConnecting = false;
  private reconnectTimer: any = null;
  private reconnectIntervalId: any = null;
  private shouldReconnect = true;
  private reconnectFailedSubject = new Subject<void>();
  private allowReconnectAttempts = false;
  private reconnectTicks = 0;

  /** Yeniden bağlandığında tekrar gönderilmek üzere son alarmconnect alarmList */
  private lastAlarmConnect: number[] | null = null;
  /** Yeniden bağlandığında tekrar gönderilmek üzere son clientconnect readerList */
  private lastClientConnect: number[] | null = null;

  constructor(
    private toastr: ToastrService,
    private ngZone: NgZone
  ) {
    this.connect();
  }

  /**
   * Base WebSocket URL (environment'dan)
   */
  private getBaseWsUrl(): string {
    if (environment.settings[environment.setting as keyof typeof environment.settings].wsUrl) {
      return environment.settings[environment.setting as keyof typeof environment.settings].wsUrl;
    }
    return environment.settings[environment.setting as keyof typeof environment.settings].apiUrl
      .replace('http://', 'ws://')
      .replace('https://', 'wss://');
  }

  /**
   * Her iki kanalı da bağla: /ws (ana) ve /wsLive (canlı izleme).
   */
  connect(): void {
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    if (this.socket?.readyState === WebSocket.OPEN && this.socketLive?.readyState === WebSocket.OPEN) {
      return;
    }

    this.stopReconnectLoop();

    try {
      this.isConnecting = true;
      if (this.allowReconnectAttempts) {
        this.toastr.info('Tekrar bağlanmayı deniyor...', 'WebSocket');
      }

      const baseUrl = this.getBaseWsUrl();

      this.connectMain(baseUrl);
      this.connectLive(baseUrl);
    } catch (error) {
      this.isConnecting = false;
      console.error('Error connecting to WebSocket:', error);
      this.connectionStatus.next(false);
      this.connectionStatusLive.next(false);
      if (this.allowReconnectAttempts && this.shouldReconnect) {
        this.attemptReconnect();
      }
    }
  }

  /**
   * Ana kanal /ws — formatconnect, alarmconnect, checkReader, alarm popup
   */
  private connectMain(baseUrl: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    if (this.socket?.readyState === WebSocket.CONNECTING) return;

    try {
      if (this.socket) {
        try { this.socket.close(); } catch (_) {}
      }
      this.socket = new WebSocket(`${baseUrl}/${WS_ENDPOINT}`);

      this.socket.onopen = () => {
        this.isConnecting = false;
        this.connectionStatus.next(true);
        this.reconnectAttempts = 0;
        this.stopReconnectLoop();
        if (this.lastAlarmConnect && this.lastAlarmConnect.length > 0) {
          try {
            this.socket!.send(JSON.stringify({ type: 'alarmconnect', alarmList: this.lastAlarmConnect }));
          } catch (_) {}
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const msgType = data.Type ?? data.type;
          if (msgType === 'ping' && (data.Time != null || data.time != null)) {
            const t = data.Time ?? data.time;
            this.socket?.send(JSON.stringify({ type: 'pong', time: t }));
            return;
          }
          this.messageSubject.next(data);
        } catch (error) {
          console.error('Error parsing WebSocket message (main):', error);
        }
      };

      this.socket.onerror = () => {
        this.isConnecting = false;
        this.connectionStatus.next(false);
      };

      this.socket.onclose = (event) => {
        this.isConnecting = false;
        this.connectionStatus.next(false);
        if (!this.allowReconnectAttempts) return;
        if (this.shouldReconnect && event.code !== 1000 && event.code !== 1001) {
          this.attemptReconnect();
        } else if (event.code === 1000 || event.code === 1001) {
          this.shouldReconnect = false;
        }
      };
    } catch (error) {
      console.error('Error creating main WebSocket:', error);
      this.connectionStatus.next(false);
    }
  }

  /**
   * Canlı izleme kanalı /wsLive — sadece clientconnect ve Type==='live' mesajları
   */
  private connectLive(baseUrl: string): void {
    if (this.socketLive?.readyState === WebSocket.OPEN) return;
    if (this.socketLive?.readyState === WebSocket.CONNECTING) return;

    try {
      if (this.socketLive) {
        try { this.socketLive.close(); } catch (_) {}
      }
      this.socketLive = new WebSocket(`${baseUrl}/${WS_LIVE_ENDPOINT}`);

      this.socketLive.onopen = () => {
        this.connectionStatusLive.next(true);
        if (this.lastClientConnect && this.lastClientConnect.length > 0) {
          try {
            this.socketLive!.send(JSON.stringify({ type: 'clientconnect', readerList: this.lastClientConnect }));
          } catch (_) {}
        }
      };

      this.socketLive.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const msgType = data.Type ?? data.type;
          if (msgType === 'ping' && (data.Time != null || data.time != null)) {
            const t = data.Time ?? data.time;
            this.socketLive?.send(JSON.stringify({ type: 'pong', time: t }));
            return;
          }
          this.messageLiveSubject.next(data);
        } catch (error) {
          console.error('Error parsing WebSocket message (live):', error);
        }
      };

      this.socketLive.onerror = () => {
        this.connectionStatusLive.next(false);
      };

      this.socketLive.onclose = () => {
        this.connectionStatusLive.next(false);
        // Canlı izleme kanalı için reconnect loop tetiklenmez; sadece ana kanal tetikler
      };
    } catch (error) {
      console.error('Error creating live WebSocket:', error);
      this.connectionStatusLive.next(false);
    }
  }

  private stopReconnectLoop(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.reconnectIntervalId) {
      clearInterval(this.reconnectIntervalId);
      this.reconnectIntervalId = null;
    }
  }

  private attemptReconnect(): void {
    if (this.isConnecting || this.reconnectIntervalId) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('WebSocket: Max reconnect attempts reached. Stopping reconnection.');
      this.ngZone.run(() => this.reconnectFailedSubject.next());
      this.shouldReconnect = false;
      return;
    }

    this.reconnectTicks = 0;
    this.reconnectIntervalId = setInterval(() => {
      this.reconnectTicks++;

      if (this.socket?.readyState === WebSocket.OPEN) {
        this.stopReconnectLoop();
        this.reconnectAttempts = 0;
        this.reconnectTicks = 0;
        return;
      }

      if (this.reconnectTicks >= this.maxReconnectAttempts) {
        this.shouldReconnect = false;
        this.ngZone.run(() => this.reconnectFailedSubject.next());
        this.stopReconnectLoop();
        return;
      }

      if (this.isConnecting) return;

      this.reconnectAttempts++;
      this.connect();
    }, this.reconnectInterval);
  }

  private waitForMainConnection(timeout: number = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }
      let checkInterval: any = null;
      let timeoutId: any = null;
      let sub: any = null;
      const cleanup = () => {
        if (checkInterval) clearInterval(checkInterval);
        if (timeoutId) clearTimeout(timeoutId);
        if (sub) sub.unsubscribe();
      };
      sub = this.connectionStatus.subscribe((ok) => {
        if (ok && this.socket?.readyState === WebSocket.OPEN) {
          cleanup();
          resolve();
        }
      });
      checkInterval = setInterval(() => {
        if (this.socket?.readyState === WebSocket.OPEN) {
          cleanup();
          resolve();
        } else if (this.socket?.readyState === WebSocket.CLOSED && !this.isConnecting) {
          cleanup();
          reject(new Error('Connection failed'));
        }
      }, 100);
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Connection timeout'));
      }, timeout);
      if (!this.isConnecting && (!this.socket || this.socket.readyState !== WebSocket.CONNECTING)) {
        this.shouldReconnect = true;
        this.reconnectAttempts = 0;
        this.connect();
      }
    });
  }

  private waitForLiveConnection(timeout: number = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socketLive?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }
      let checkInterval: any = null;
      let timeoutId: any = null;
      let sub: any = null;
      const cleanup = () => {
        if (checkInterval) clearInterval(checkInterval);
        if (timeoutId) clearTimeout(timeoutId);
        if (sub) sub.unsubscribe();
      };
      sub = this.connectionStatusLive.subscribe((ok) => {
        if (ok && this.socketLive?.readyState === WebSocket.OPEN) {
          cleanup();
          resolve();
        }
      });
      checkInterval = setInterval(() => {
        if (this.socketLive?.readyState === WebSocket.OPEN) {
          cleanup();
          resolve();
        } else if (this.socketLive?.readyState === WebSocket.CLOSED) {
          cleanup();
          reject(new Error('Live connection failed'));
        }
      }, 100);
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Live connection timeout'));
      }, timeout);
      if (!this.socketLive || this.socketLive.readyState !== WebSocket.CONNECTING) {
        this.connect();
      }
    });
  }

  /**
   * Mesaj gönder. clientconnect → /wsLive; diğerleri (formatconnect, alarmconnect, checkReader vb.) → /ws.
   */
  async sendMessage(message: any): Promise<void> {
    const isLive = message?.type === 'clientconnect';

    if (isLive) {
      if (!this.socketLive || this.socketLive.readyState !== WebSocket.OPEN) {
        try {
          await this.waitForLiveConnection(5000);
        } catch (error) {
          console.error('Failed to connect to live WebSocket:', error);
          console.warn('clientconnect not sent:', message);
          return;
        }
      }
      if (this.socketLive?.readyState === WebSocket.OPEN) {
        const payload = message.readerList != null
          ? { type: 'clientconnect', readerList: message.readerList }
          : message;
        this.lastClientConnect = message.readerList != null ? [...message.readerList] : null;
        this.socketLive.send(JSON.stringify(payload));
      }
      return;
    }

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      try {
        await this.waitForMainConnection(5000);
      } catch (error) {
        console.error('Failed to reconnect WebSocket:', error);
        console.warn('Message not sent due to connection failure:', message);
        return;
      }
    }

    if (this.socket?.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is still not connected. Message not sent:', message);
      return;
    }

    let messageToSend: any;
    if (message.type === 'formatconnect' && message.card != null && message.reader != null) {
      messageToSend = {
        type: 'formatconnect',
        card: message.card,
        reader: message.reader,
        token: localStorage.getItem('token')
      };
    } else if (message.type === 'alarmconnect' && message.alarmList != null) {
      this.lastAlarmConnect = [...message.alarmList];
      messageToSend = { type: 'alarmconnect', alarmList: message.alarmList };
    } else if (message.type) {
      messageToSend = { type: message.type, data: message.data || message };
      messageToSend.token = localStorage.getItem('token');
    } else {
      messageToSend = { type: 'checkReader', data: message };
      messageToSend.token = localStorage.getItem('token');
    }
    this.socket.send(JSON.stringify(messageToSend));
  }

  /** Ana kanal mesajları: formatconnect yanıtları, alarm, checkReader, alarm popup (isPopUp) */
  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  /** Canlı izleme kanalı mesajları: sadece Type === 'live' (geçiş kayıtları) */
  getLiveMessages(): Observable<any> {
    return this.messageLiveSubject.asObservable();
  }

  /** Ana kanal bağlantı durumu (header yeşil/kırmızı, reconnect dialog) */
  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  /** Canlı izleme kanalı bağlantı durumu (LiveView için) */
  getLiveConnectionStatus(): Observable<boolean> {
    return this.connectionStatusLive.asObservable();
  }

  getReconnectFailed(): Observable<void> {
    return this.reconnectFailedSubject.asObservable();
  }

  /** Ana kanal bağlı mı (header, employee format modal) */
  isConnected(): boolean {
    return this.socket != null && this.socket.readyState === WebSocket.OPEN;
  }

  /** Canlı izleme kanalı bağlı mı */
  isLiveConnected(): boolean {
    return this.socketLive != null && this.socketLive.readyState === WebSocket.OPEN;
  }

  reconnect(): void {
    this.allowReconnectAttempts = true;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.connect();
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.stopReconnectLoop();

    if (this.socket) {
      try { this.socket.close(1000); } catch (_) {}
      this.socket = null;
    }
    if (this.socketLive) {
      try { this.socketLive.close(1000); } catch (_) {}
      this.socketLive = null;
    }

    this.isConnecting = false;
    this.connectionStatus.next(false);
    this.connectionStatusLive.next(false);
  }
}
