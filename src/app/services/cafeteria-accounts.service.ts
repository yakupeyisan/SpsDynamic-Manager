import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CafeteriaAccount {
  ID?: number;
  AccountName?: string;
  SettingId?: number;
  PosDevices?: any[];
  PaymentSetting?: any;
  recid?: number;
  Balance?: number; // Kuruş cinsinden (varsa)
  LastTransactionDate?: string; // (varsa)
  IsActive?: boolean; // (varsa)
  [key: string]: any;
}

export interface CafeteriaEvent {
  CafeteriaEventID?: number;
  CafeteriaAccountId?: number;
  CafeteriaGroupName?: string;
  PaymentId?: number;
  EmployeeID?: number;
  TransactionType?: string;
  TagCode?: string;
  ProductName?: string;
  ApplicationName?: string;
  ApplicationID?: number | null;
  Qty?: number;
  Price?: number;
  TotalPrice?: number;
  LastBalance?: number; // Kuruş cinsinden
  Location?: string;
  DeviceSerial?: string;
  EventTime?: string;
  RecordTime?: string;
  isOffline?: boolean;
  Note?: string | null;
  Employee?: any;
  Payment?: any;
  Card?: any;
  PaymentSetting?: any;
  Terminal?: any;
  SubscriptionEvents?: any[];
  CafeteriaSales?: any[];
  [key: string]: any;
}

export interface Payment {
  Id?: number;
  ProjectID?: string | null;
  AccountId?: number;
  Amount?: number; // Kuruş cinsinden
  PaymentType?: number;
  PayeeId?: number;
  ResultStatus?: string; // "0" = başarısız, "1" = başarılı
  Description?: string | null;
  Details?: string | null;
  Provision?: string;
  MeansOfPayment?: string | number;
  IsCancel?: boolean;
  TransactionId?: string;
  CafeteriaEvent?: CafeteriaEvent | null;
  PaymentOfVirtualPos?: PaymentOfVirtualPos | null;
  Account?: any;
  PaymentOrders?: any[];
  PaymentLogs?: any[];
  [key: string]: any;
}
export interface PaymentOfVirtualPos {
  PaymentId?: number;
  EmployeeID?: number;
  SettingId?: number;
  IdentityType?: any;
  IdentificationNumber?: string;
  Phone?: string | null;
  Email?: string | null;
  PaymentName?: string | null;
  PayBank?: string | null;
  NameOfBank?: string | null;
  CardHolderName?: string | null;
  MaskedCreditCard?: string | null;
  MdStatus?: number;
  Response?: string | null;
  Message?: string | null;
  Status?: string | null;
  AuthCode?: string | null;
  AgreementTime?: string | null;
  Agreement?: string | null;
  ProcessTime?: string;
  ValorDate?: string;
  IsSuccess?: boolean;
  Location?: string | null;
  FullName?: string | null;
  PaymentGroup?: string | null;
  ReallySetting?: any;
  Employee?: any;
  Payment?: any;
  [key: string]: any;
} 
export interface CafeteriaAccountsResponse {
  status?: string;
  total?: number;
  records?: CafeteriaAccount[];
  data?: CafeteriaAccount[]; // Fallback için
  [key: string]: any;
}

// API paginated response döndürüyor
export interface CafeteriaAccountTransactionsResponse {
  status?: string;
  total?: number;
  records?: Payment[];
  page?: number;
  limit?: number;
  data?: Payment[]; // Fallback için
  count?: number; // Fallback için
}

// CafeteriaEvents için paginated response
export interface CafeteriaAccountEventsResponse {
  status?: string;
  total?: number;
  records?: CafeteriaEvent[];
  page?: number;
  limit?: number;
  data?: CafeteriaEvent[]; // Fallback için
  count?: number; // Fallback için
}

// Eski format için type (geriye dönük uyumluluk)
export type CafeteriaAccountTransactionsResponseOld = Payment[];

export interface LoadBalanceRequest {
  amount: number; // Kuruş cinsinden
  paymentMethod?: string;
}

export interface LoadBalanceResponse {
  success?: boolean;
  message?: string;
  data?: any;
  [key: string]: any;
}

export interface CreatePaymentForClientRequest {
  AccountId: number;
  Amount: number; // TL cinsinden (decimal, örn: 100.00)
  Description?: string;
}

export interface CreatePaymentForClientResponse {
  success?: boolean;
  status?: string; // "pending" veya başarılı durumda başka bir değer
  message?: string;
  data?: {
    payment?: number;
    amount?: string;
    htmlContent?: string; // 3D Secure formu HTML içeriği
    TransactionId?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface TotalBalanceResponse {
  accountId?: number;
  employeeId?: number;
  totalBalance?: number; // TL cinsinden
  totalDepositLastMonth?: number; // TL cinsinden - Son 1 aylık yükleme
  totalExpenseLastMonth?: number; // TL cinsinden - Son 1 aylık harcama
  [key: string]: any;
}

export interface CheckPaymentRequest {
  Id: number;
}

export interface CheckPaymentResponse {
  success?: boolean;
  message?: string;
  [key: string]: any;
}

export interface GraphEventItem {
  PaymentStatus: "Başarılı" | "Başarısız" | "Harcama";
  Amount: number; // Pozitif (yükleme) veya negatif (harcama)
  TransactionDate: string; // "2025-12-24" formatında
  Type: "Payment" | "CafeteriaEvent";
  PaymentId?: number; // Payment için
  CafeteriaEventID?: number; // CafeteriaEvent için
  Description?: string;
}

export interface EventsForGraphResponse {
  data: GraphEventItem[];
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class CafeteriaAccountsService {
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
   * Get user's cafeteria accounts
   * GET /api/CafeteriaAccounts
   */
  getMyAccounts(): Observable<CafeteriaAccountsResponse> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    return this.http.get<CafeteriaAccountsResponse>(this.getApiUrl('/api/CafeteriaAccounts'));
  }

  /**
   * Get account transactions
   * GET /api/Payments/GetByAccounts/{accountId}?page={page}&limit={limit}
   * @param accountId Account ID
   * @param page Page number (0-based, optional)
   * @param limit Page size (optional, default: 10)
   */
  getAccountPaymentransactions(accountId: number, page?: number, limit?: number): Observable<CafeteriaAccountTransactionsResponse | Payment[]> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    let url = `/api/Payments/GetByAccounts/${accountId}`;
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
    
    return this.http.get<CafeteriaAccountTransactionsResponse | Payment[]>(this.getApiUrl(url));
  }
  /**
   * Get cafeteria events for a specific account
   * GET /api/CafeteriaEvents/{accountId}/Events?page={page}&limit={limit}
   * @param accountId Account ID
   * @param page Page number (0-based, optional)
   * @param limit Page size (optional, default: 10)
   */
  getAccountCafeteriaEventTransactions(accountId: number, page?: number, limit?: number): Observable<CafeteriaAccountEventsResponse | CafeteriaEvent[]> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    let url = `/api/CafeteriaEvents/${accountId}/Events`;
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
    
    return this.http.get<CafeteriaAccountEventsResponse | CafeteriaEvent[]>(this.getApiUrl(url));
  }

  /**
   * Load balance to account (virtual pos payment) - DEPRECATED
   * POST /api/CafeteriaAccounts/{accountId}/LoadBalance
   * Bu metod yerine createPaymentForClient kullanılmalıdır
   */
  loadBalance(accountId: number, request: LoadBalanceRequest): Observable<LoadBalanceResponse> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    return this.http.post<LoadBalanceResponse>(
      this.getApiUrl(`/api/CafeteriaAccounts/${accountId}/LoadBalance`),
      request
    );
  }

  /**
   * Create payment for client (3D Secure payment)
   * POST /api/Banks/CreatePaymentForClient
   */
  createPaymentForClient(request: CreatePaymentForClientRequest): Observable<CreatePaymentForClientResponse> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    return this.http.post<CreatePaymentForClientResponse>(
      this.getApiUrl('/api/Banks/CreatePaymentForClient'),
      request
    );
  }

  /**
   * Get total balance for account (user's balance in the account)
   * GET /api/CafeteriaEvents/GetTotalBalanceWithAccountId/{accountId}
   */
  getTotalBalance(accountId: number): Observable<TotalBalanceResponse> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    return this.http.get<TotalBalanceResponse>(
      this.getApiUrl(`/api/CafeteriaEvents/GetTotalBalanceWithAccountId/${accountId}`)    
    );
  }

  /**
   * Check payment (start reconciliation/mütabakat)
   * POST /api/Banks/CheckPayment
   */
  checkPayment(paymentId: number): Observable<CheckPaymentResponse> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    const request: CheckPaymentRequest = { Id: paymentId };
    return this.http.post<CheckPaymentResponse>(
      this.getApiUrl('/api/Banks/CheckPayment'),
      request
    );
  }

  /**
   * Get events for graph (combined payments and cafeteria events)
   * GET /api/CafeteriaEvents/{accountId}/EventsForGraph
   */
  getAccountEventsForGraph(accountId: number): Observable<EventsForGraphResponse> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    return this.http.get<EventsForGraphResponse>(
      this.getApiUrl(`/api/CafeteriaEvents/${accountId}/EventsForGraph`)
    );
  }

}

