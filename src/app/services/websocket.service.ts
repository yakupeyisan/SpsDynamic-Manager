import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<any>();
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds
  private isConnecting = false; // Prevent multiple simultaneous connection attempts
  private reconnectTimer: any = null; // Store reconnect timer to clear if needed
  private shouldReconnect = true; // Flag to control reconnection

  constructor() {
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

    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    try {
      this.isConnecting = true;
      
      // Use wsUrl if provided, otherwise derive from apiUrl
      let wsUrl: string;
      if (environment.wsUrl) {
        wsUrl = environment.wsUrl;
      } else {
        // Convert http:// to ws:// or https:// to wss://
        wsUrl = environment.apiUrl
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
        
        // Only attempt reconnect if:
        // 1. shouldReconnect is true
        // 2. Close code is not 1000 (normal closure) or 1001 (going away)
        // 3. We haven't exceeded max reconnect attempts
        if (this.shouldReconnect && event.code !== 1000 && event.code !== 1001) {
          this.attemptReconnect();
        } else if (event.code === 1000 || event.code === 1001) {
          // Normal closure - don't reconnect
          this.shouldReconnect = false;
        }
      };
    } catch (error) {
      this.isConnecting = false;
      console.error('Error connecting to WebSocket:', error);
      this.connectionStatus.next(false);
      // Only reconnect if we should
      if (this.shouldReconnect) {
        this.attemptReconnect();
      }
    }
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  private attemptReconnect(): void {
    // Don't reconnect if already connecting or if we've exceeded max attempts
    if (this.isConnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('WebSocket: Max reconnect attempts reached. Stopping reconnection.');
        this.shouldReconnect = false;
      }
      return;
    }

    this.reconnectAttempts++;
    
    // Clear any existing timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.shouldReconnect) {
        this.connect();
      }
    }, this.reconnectInterval);
  }

  /**
   * Send message through WebSocket
   * PHP server expects messages in format: { type: 'xxx', data: {...} }
   */
  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Prepare message to send
      let messageToSend: any;
      
      if (message.type) {
        // Has type, use as is or wrap data
        messageToSend = {
          type: message.type,
          data: message.data || message
        };
      } else {
        // Default: assume it's a checkReader message
        messageToSend = {
          type: 'checkReader',
          data: message
        };
      }
      messageToSend.token = localStorage.getItem('token');
      this.socket.send(JSON.stringify(messageToSend));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
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
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.shouldReconnect = false; // Stop reconnecting when manually disconnected
    
    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.close(1000); // Normal closure
      this.socket = null;
    }
    
    this.isConnecting = false;
    this.connectionStatus.next(false);
  }
}
