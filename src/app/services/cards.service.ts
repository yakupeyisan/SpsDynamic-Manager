import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Card {
  CardID?: number;
  CardTypeID?: number;
  EmployeeID?: number;
  CafeteriaGroupID?: number;
  TagCode?: string;
  FacilityCode?: string;
  Plate?: string;
  CardUID?: string;
  CardDesc?: string | null;
  CardPassword?: string | null;
  isDefined?: boolean;
  isVisitor?: boolean;
  DefinedTime?: string;
  Status?: string | number | boolean;
  DayOfMonth?: number | null;
  DayOfWeek?: number | null;
  CardStatusId?: number;
  CardCode?: string | null;
  CardCodeType?: string;
  TransferTagCode?: string | null;
  BackupCardUID?: string | null;
  ReferanceID?: number | null;
  OfflineMapUpdateTime?: string | null;
  isFingerPrint?: boolean;
  FingerPrintTemplate?: string | null;
  FingerPrintUpdateTime?: string | null;
  TemporaryId?: number | null;
  TemporaryDate?: string | null;
  PersonInfo01?: string;
  PersonInfo02?: string;
  PersonInfo03?: string;
  PersonInfo04?: string;
  PersonInfo05?: string;
  PersonInfo06?: string;
  PersonInfo07?: string;
  PersonInfo08?: string;
  PersonInfo09?: string;
  PersonInfo10?: string;
  Employee?: any;
  CardStatus?: {
    Id: number;
    Name: string;
  };
  CardWriteLists?: any[];
  PaymentTransactions?: any[];
  AuthorizationCards?: any[];
  CafeteriaGroup?: {
    CafeteriaGroupID: number;
    ProjectID: string;
    CafeteriaGroupName: string;
    TerminalTariffs?: any[];
    SubscriptionPackageCafeteriaGroups?: any[];
    Cards?: any[];
  };
  recid?: number;
  [key: string]: any;
}

export interface MyCardsResponse {
  status: string;
  total: number;
  records: Card[];
}

export interface GetQrResponse {
  success?: boolean;
  data?: string;
  qrCode?: string;
  message?: string;
  [key: string]: any;
}

export interface GenerateTemporaryIdResponse {
  success?: boolean;
  data?: {
    temporaryId?: string;
    password?: string;
    createdDate?: string;
    expirationDate?: string;
  };
  temporaryId?: string;
  password?: string;
  createdDate?: string;
  expirationDate?: string;
  message?: string;
  [key: string]: any;
}

export interface ChangeCardPasswordRequest {
  cardPassword: string;
}

export interface ChangeCardPasswordResponse {
  success?: boolean;
  message?: string;
  [key: string]: any;
}

export interface ChangeStatusResponse {
  success?: boolean;
  message?: string;
  [key: string]: any;
}

export interface BulkUpdateStatusRequest {
  CardIDs: number[];
  Status: boolean;
}

export interface AccessEvent {
  AccessEventID?: number;
  DeviceEventID?: number;
  EmployeeID?: number;
  TagCode?: string;
  inOUT?: string; // "0" = Giriş, "1" = Çıkış
  Location?: string;
  DeviceSerial?: string;
  EventType?: string;
  EventDesc?: string;
  EventTime?: string;
  RecordTime?: string;
  isOffline?: boolean;
  isPdks?: boolean;
  EventSource?: string;
  ReferanceID?: number | null;
  Employee?: any;
  Card?: any;
  Terminal?: any;
  [key: string]: any;
}

export interface CafeteriaEvent {
  CafeteriaEventID?: number;
  CafeteriaAccountId?: number;
  CafeteriaGroupName?: string;
  PaymentId?: number;
  EmployeeID?: number;
  TransactionType?: string; // "3", "4" gibi
  TagCode?: string;
  ProductName?: string | null;
  ApplicationName?: string;
  ApplicationID?: number | null;
  Qty?: number;
  Price?: number; // Kuruş cinsinden
  TotalPrice?: number; // Kuruş cinsinden (negatif olabilir)
  LastBalance?: number; // Kuruş cinsinden
  Location?: string;
  DeviceSerial?: string;
  EventTime?: string;
  RecordTime?: string;
  isOffline?: boolean;
  Note?: string;
  Employee?: any;
  Card?: any;
  PaymentSetting?: any;
  Terminal?: any;
  SubscriptionEvents?: any[];
  CafeteriaSales?: any[];
  [key: string]: any;
}


@Injectable({
  providedIn: 'root',
})
export class CardsService {
  private apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Helper method to get API URL
   * Development'ta proxy kullanıldığı için boş string olabilir
   */
  private getApiUrl(path: string): string {
    return this.apiUrl ? `${this.apiUrl}${path}` : path;
  }

  /**
   * Get current user's cards
   * GET /api/Cards/MyCards?CafeteriaAccountId={accountId}
   * @param cafeteriaAccountId Optional - If provided, filters cards by cafeteria account ID
   */
  getMyCards(cafeteriaAccountId?: number): Observable<MyCardsResponse> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    let url = '/api/Cards/MyCards';
    if (cafeteriaAccountId) {
      url += `?CafeteriaAccountId=${cafeteriaAccountId}`;
    }
    return this.http.get<MyCardsResponse>(this.getApiUrl(url));
  }

  /**
   * Get QR code for a card
   * GET /api/Cards/GetQr/{id}
   */
  getQr(cardId: number): Observable<GetQrResponse> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    return this.http.get<GetQrResponse>(this.getApiUrl(`/api/Cards/GetQr/${cardId}`));
  }

  /**
   * Generate temporary password for a card
   * GET /api/Cards/GenerateTemporaryId/{cardId}
   */
  generateTemporaryId(cardId: number): Observable<GenerateTemporaryIdResponse> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    return this.http.get<GenerateTemporaryIdResponse>(this.getApiUrl(`/api/Cards/GenerateTemporaryId/${cardId}`));
  }

  /**
   * Change card password
   * POST /api/Cards/ChangeCardPassword/{cardId}
   */
  changeCardPassword(cardId: number, cardPassword: string): Observable<ChangeCardPasswordResponse> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    const request: ChangeCardPasswordRequest = { cardPassword };
    return this.http.post<ChangeCardPasswordResponse>(this.getApiUrl(`/api/Cards/ChangeCardPassword/${cardId}`), request);
  }

  /**
   * Bulk update card status (active/passive)
   * POST /api/Cards/BulkUpdateStatus
   */
  bulkUpdateStatus(cardIds: number[], status: boolean): Observable<ChangeStatusResponse> {
    return this.http.post<ChangeStatusResponse>(this.getApiUrl('/api/Cards/BulkUpdateStatus'), {
      CardIDs: cardIds,
      Status: status
    });
  }

  /**
   * Change card status (close card)
   * POST /api/Cards/ChangeStatus/{cardId}
   */
  changeStatus(cardId: number): Observable<ChangeStatusResponse> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    return this.http.post<ChangeStatusResponse>(this.getApiUrl(`/api/Cards/ChangeStatus/${cardId}`), {});
  }

  /**
   * Get card access events
   * GET /api/Cards/{TagCode}/AccessEvents?page={page}&limit={limit}
   * @param tagCode Card TagCode
   * @param page Page number (0-based, optional)
   * @param limit Page size (optional, default: 10)
   */
  getCardAccessEvents(tagCode: string, page?: number, limit?: number): Observable<{ success?: boolean; message?: string; data?: AccessEvent[]; status?: string; total?: number; records?: AccessEvent[]; [key: string]: any }> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    let url = `/api/Cards/${tagCode}/AccessEvents`;
    const params: string[] = [];
    
    if (page !== undefined && page !== null) {
      params.push(`page=${page}`);
    }
    if (limit !== undefined && limit !== null) {
      params.push(`limit=${limit}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<{ success?: boolean; message?: string; data?: AccessEvent[]; status?: string; total?: number; records?: AccessEvent[]; [key: string]: any }>(this.getApiUrl(url));
  }

  /**
   * Get card cafeteria events
   * GET /api/Cards/{TagCode}/CafeteriaEvents?page={page}&limit={limit}
   * @param tagCode Card TagCode
   * @param page Page number (0-based, optional)
   * @param limit Page size (optional, default: 10)
   */
  getCardCafeteriaEvents(tagCode: string, page?: number, limit?: number): Observable<{ success?: boolean; message?: string; data?: CafeteriaEvent[]; status?: string; total?: number; records?: CafeteriaEvent[]; [key: string]: any }> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    let url = `/api/Cards/${tagCode}/CafeteriaEvents`;
    const params: string[] = [];
    
    if (page !== undefined && page !== null) {
      params.push(`page=${page}`);
    }
    if (limit !== undefined && limit !== null) {
      params.push(`limit=${limit}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<{ success?: boolean; message?: string; data?: CafeteriaEvent[]; status?: string; total?: number; records?: CafeteriaEvent[]; [key: string]: any }>(this.getApiUrl(url));
  }
}

