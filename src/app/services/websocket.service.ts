import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<any>();
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000; // 1 second
  private isConnecting = false; // Prevent multiple simultaneous connection attempts
  private reconnectTimer: any = null; // Store reconnect timer/interval to clear if needed
  private reconnectIntervalId: any = null; // Store reconnect interval ID to clear if needed
  private shouldReconnect = true; // Flag to control reconnection
  private reconnectFailedSubject = new Subject<void>();
  /** İlk yüklemede false; kullanıcı kırmızı butona basınca true. Sadece true iken 5 deneme + dialog. */
  private allowReconnectAttempts = false;
  /** Kaç tick geçti (isConnecting yüzünden return edilse bile artar); 5 tick sonunda dialog. */
  private reconnectTicks = 0;

  constructor(
    private toastr: ToastrService,
    private ngZone: NgZone
  ) {
    this.connect();
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // If already connected, don't reconnect
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    // Clear any existing reconnect timer/interval
    this.stopReconnectLoop();

    try {
      this.isConnecting = true;
      if (this.allowReconnectAttempts) {
        this.toastr.info('Tekrar bağlanmayı deniyor...', 'WebSocket');
      }

      // Use wsUrl if provided, otherwise derive from apiUrl
      let wsUrl: string;
      if (environment.settings[environment.setting as keyof typeof environment.settings].wsUrl) {
        wsUrl = environment.settings[environment.setting as keyof typeof environment.settings].wsUrl;
      } else {
        // Convert http:// to ws:// or https:// to wss://
        wsUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl
          .replace('http://', 'ws://')
          .replace('https://', 'wss://');
      }
      
      const wsEndpoint = `${wsUrl}/ws`; // Adjust endpoint as needed
      
      // Close existing socket if any
      if (this.socket) {
        try {
          this.socket.close();
        } catch (e) {
          // Ignore
        }
      }
      
      this.socket = new WebSocket(wsEndpoint);

      this.socket.onopen = () => {
        this.isConnecting = false;
        this.connectionStatus.next(true);
        this.reconnectAttempts = 0;
        // Stop reconnect loop when connection is established
        this.stopReconnectLoop();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messageSubject.next(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        this.isConnecting = false;
        console.error('WebSocket error:', error);
        this.connectionStatus.next(false);
      };

      this.socket.onclose = (event) => {
        this.isConnecting = false;
        this.connectionStatus.next(false);
        // İlk yüklemede yeniden deneme yok; sadece kullanıcı kırmızı butona bastığında 5 deneme
        if (!this.allowReconnectAttempts) {
          return;
        }
        if (this.shouldReconnect && event.code !== 1000 && event.code !== 1001) {
          this.attemptReconnect();
        } else if (event.code === 1000 || event.code === 1001) {
          this.shouldReconnect = false;
        }
      };
    } catch (error) {
      this.isConnecting = false;
      console.error('Error connecting to WebSocket:', error);
      this.connectionStatus.next(false);
      if (this.allowReconnectAttempts && this.shouldReconnect) {
        this.attemptReconnect();
      }
    }
  }

  /**
   * Stop reconnect loop
   */
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

  /**
   * Attempt to reconnect to WebSocket
   * Starts a loop that tries to reconnect every second until connected or max attempts reached
   */
  private attemptReconnect(): void {
    // Don't start reconnect loop if already connecting or if loop is already running
    if (this.isConnecting || this.reconnectIntervalId) {
      return;
    }

    // Don't reconnect if we've exceeded max attempts
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('WebSocket: Max reconnect attempts reached. Stopping reconnection.');
      this.ngZone.run(() => this.reconnectFailedSubject.next());
      this.shouldReconnect = false;
      return;
    }

    // Start reconnect loop - try every second
    //console.log('WebSocket: Starting reconnect loop (1 attempt per second)');
    this.reconnectTicks = 0;
    this.reconnectIntervalId = setInterval(() => {
      this.reconnectTicks++;

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.stopReconnectLoop();
        this.reconnectAttempts = 0;
        this.reconnectTicks = 0;
        return;
      }

      // 5 tick geçtiyse (isConnecting yüzünden return olsa bile) dialog tetikle
      if (this.reconnectTicks >= this.maxReconnectAttempts) {
        console.warn('WebSocket: Max reconnect attempts reached. Stopping reconnection.');
        this.shouldReconnect = false;
        this.ngZone.run(() => this.reconnectFailedSubject.next());
        this.stopReconnectLoop();
        return;
      }

      if (this.isConnecting) {
        return;
      }

      this.reconnectAttempts++;
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * Wait for WebSocket connection to be established
   * Returns a promise that resolves when connected or rejects after timeout
   */
  private waitForConnection(timeout: number = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already connected, resolve immediately
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      let checkInterval: any = null;
      let timeoutId: any = null;
      let subscription: any = null;

      const cleanup = () => {
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (subscription) {
          subscription.unsubscribe();
          subscription = null;
        }
      };

      // Subscribe to connection status for more reliable checking
      subscription = this.connectionStatus.subscribe((isConnected) => {
        if (isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
          cleanup();
          resolve();
        }
      });

      // Also check readyState periodically as a fallback
      checkInterval = setInterval(() => {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          cleanup();
          resolve();
        } else if (this.socket && this.socket.readyState === WebSocket.CLOSED && !this.isConnecting) {
          cleanup();
          reject(new Error('Connection failed'));
        }
      }, 100);

      // Set timeout
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Connection timeout'));
      }, timeout);

      // If not connecting, start connection attempt
      if (!this.isConnecting && (!this.socket || this.socket.readyState !== WebSocket.CONNECTING)) {
        this.shouldReconnect = true;
        this.reconnectAttempts = 0; // Reset attempts for manual reconnect
        this.connect();
      }
    });
  }

  /**
   * Send message through WebSocket
   * PHP server expects messages in format: { type: 'xxx', data: {...} }
   * If connection is not available, it will attempt to reconnect first
   */
  async sendMessage(message: any): Promise<void> {
    // Check if connection is open
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      //console.log('WebSocket is not connected. Attempting to reconnect...');
      
      try {
        // Wait for connection (with 5 second timeout)
        await this.waitForConnection(5000);
        //console.log('WebSocket reconnected successfully');
      } catch (error) {
        console.error('Failed to reconnect WebSocket:', error);
        console.warn('Message not sent due to connection failure:', message);
        return;
      }
    }

    // At this point, connection should be open
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Prepare message to send
      let messageToSend: any;
      
      // Special handling for formatconnect - send as is with card and reader at top level
      if (message.type === 'formatconnect' && message.card && message.reader) {
        messageToSend = {
          type: 'formatconnect',
          card: message.card,
          reader: message.reader,
          token: localStorage.getItem('token')
        };
      } else if (message.type === 'clientconnect' && message.readerList) {
        // Special handling for clientconnect - send as is with readerList at top level
        messageToSend = {
          type: 'clientconnect',
          readerList: message.readerList
        };
      } else if (message.type === 'alarmconnect' && message.alarmList) {
        // Special handling for alarmconnect - send as is with alarmList at top level
        messageToSend = {
          type: 'alarmconnect',
          alarmList: message.alarmList
        };
      } else if (message.type) {
        // Has type, use as is or wrap data
        messageToSend = {
          type: message.type,
          data: message.data || message
        };
        messageToSend.token = localStorage.getItem('token');
      } else {
        // Default: assume it's a checkReader message
        messageToSend = {
          type: 'checkReader',
          data: message
        };
        messageToSend.token = localStorage.getItem('token');
      }
      
      this.socket.send(JSON.stringify(messageToSend));
    } else {
      console.warn('WebSocket is still not connected after reconnect attempt. Message not sent:', message);
    }
  }

  /**
   * Get messages as Observable
   */
  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  /**
   * Get connection status as Observable
   */
  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  /**
   * Emits when reconnect failed after max attempts (e.g. to show restart dialog).
   */
  getReconnectFailed(): Observable<void> {
    return this.reconnectFailedSubject.asObservable();
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Kullanıcı kırmızı butona bastığında: 5 kere bağlanmayı dene, bağlanamazsa dialog tetiklenir.
   */
  reconnect(): void {
    this.allowReconnectAttempts = true;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.connect();
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.shouldReconnect = false; // Stop reconnecting when manually disconnected
    
    // Stop reconnect loop
    this.stopReconnectLoop();
    
    if (this.socket) {
      this.socket.close(1000); // Normal closure
      this.socket = null;
    }
    
    this.isConnecting = false;
    this.connectionStatus.next(false);
  }
}
