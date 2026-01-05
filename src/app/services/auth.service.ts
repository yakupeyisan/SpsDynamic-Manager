import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  identificationNumber: string;
  password: string;
  multiFactorCode?: string;
  gRecaptchaResponse?: string;
  'cf-turnstile-response'?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: any;
  };
}

export interface RegisterWithEmailRequest {
  identificationNumber: string;
  mail: string;
}

export interface RegisterWithSmsRequest {
  identificationNumber: string;
  phone: string;
}

export interface SetPasswordRequest {
  identificationNumber: string;
  activationCode: string;
  webPassword: string;
  mail?: string;
}

export interface ResetPasswordRequest {
  identificationNumber: string;
}

export interface ConfirmResetPasswordRequest {
  identificationNumber: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface User {
  id?: string;
  identificationNumber?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

export interface GetMeResponse {
  success: boolean;
  message?: string;
  data: User;
}

export interface ContactTypeResponse {
  success: boolean;
  data: {
    contactType: string;
  };
}

export interface CustomFieldDetail {
  Field: string;
  Name: string;
  Hidden: boolean;
  Disabled: boolean;
  Type: string;
}

export interface GetCustomFieldDetailsResponse {
  status: string;
  total: number;
  records: CustomFieldDetail[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Helper method to get API URL
   * Development'ta proxy kullanıldığı için boş string olabilir
   */
  private getApiUrl(path: string): string {
    return this.apiUrl ? `${this.apiUrl}${path}` : path;
  }

  /**
   * User login
   * POST /api/Auth/Login
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    // Headers interceptor tarafından otomatik ekleniyor
    return this.http.post<LoginResponse>(this.getApiUrl('/api/Auth/Login'), request);
  }
  /**
   * User login as admin
   * POST /api/Auth/LoginAdmin
   */
  loginAdmin(request: LoginRequest): Observable<LoginResponse> {
    // Headers interceptor tarafından otomatik ekleniyor
    return this.http.post<LoginResponse>(this.getApiUrl('/api/Auth/LoginAdmin'), request);
  }

  /**
   * User registration with email
   * POST /api/Auth/RegisterWithEmail
   */
  registerWithEmail(request: RegisterWithEmailRequest): Observable<any> {
    // Headers interceptor tarafından otomatik ekleniyor
    return this.http.post<any>(this.getApiUrl('/api/Auth/RegisterWithEmail'), request);
  }

  /**
   * User registration with SMS
   * POST /api/Auth/RegisterWithSms
   */
  registerWithSms(request: RegisterWithSmsRequest): Observable<any> {
    // Headers interceptor tarafından otomatik ekleniyor
    return this.http.post<any>(this.getApiUrl('/api/Auth/RegisterWithSms'), request);
  }

  /**
   * Set password with activation code
   * POST /api/Auth/SetPassword
   */
  setPassword(request: SetPasswordRequest): Observable<any> {
    // Headers interceptor tarafından otomatik ekleniyor
    return this.http.post<any>(this.getApiUrl('/api/Auth/SetPassword'), request);
  }

  /**
   * Request password reset (sends verification code)
   * POST /api/Auth/ResetPassword
   */
  resetPassword(request: ResetPasswordRequest): Observable<any> {
    // Headers interceptor tarafından otomatik ekleniyor
    return this.http.post<any>(this.getApiUrl('/api/Auth/ResetPassword'), request);
  }

  /**
   * Confirm password reset with verification code
   * POST /api/Auth/ConfirmResetPassword
   */
  confirmResetPassword(request: ConfirmResetPasswordRequest): Observable<any> {
    // Headers interceptor tarafından otomatik ekleniyor
    return this.http.post<any>(this.getApiUrl('/api/Auth/ConfirmResetPassword'), request);
  }

  /**
   * Change password (requires authentication)
   * POST /api/Auth/ChangePassword
   */
  changePassword(request: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    return this.http.post<ChangePasswordResponse>(this.getApiUrl('/api/Auth/ChangePassword'), request);
  }

  /**
   * Get current user information
   * GET /api/auth/me
   */
  getMe(): Observable<GetMeResponse> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    return this.http.get<GetMeResponse>(this.getApiUrl('/api/auth/me'));
  }

  /**
   * Get contact type for password reset
   * GET /api/Auth/GetContactType
   */
  getContactType(): Observable<ContactTypeResponse> {
    return this.http.get<ContactTypeResponse>(this.getApiUrl('/api/Auth/GetContactType'));
  }

  /**
   * Get custom field details for employee
   * GET /api/Employees/GetCustomFieldDetails
   */
  getCustomFieldDetails(): Observable<GetCustomFieldDetailsResponse> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    return this.http.get<GetCustomFieldDetailsResponse>(this.getApiUrl('/api/Employees/GetCustomFieldDetails'));
  }

  /**
   * Update user profile
   * PUT /api/auth/me veya POST /api/auth/update-profile
   * @deprecated Use updateEmployeeProfile instead
   */
  updateProfile(profileData: any): Observable<GetMeResponse> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    return this.http.put<GetMeResponse>(this.getApiUrl('/api/auth/me'), profileData);
  }

  /**
   * Update employee profile
   * POST /api/Employees/UpdateProfile
   */
  updateEmployeeProfile(profileData: any): Observable<any> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    return this.http.post<any>(this.getApiUrl('/api/Employees/UpdateProfile'), profileData);
  }

  /**
   * Upload profile image
   * POST /api/Employees/UpdateProfileImage
   * @param imageData Base64 encoded image data with fileName and contentType
   */
  uploadProfileImage(imageData: { imageData: string; fileName: string; contentType: string }): Observable<any> {
    // Authorization header interceptor tarafından otomatik ekleniyor
    // Content-Type header'ı JSON olarak ayarlanır
    return this.http.post<any>(this.getApiUrl('/api/Employees/UpdateProfileImage'), imageData);
  }

  /**
   * Save token to localStorage
   */
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Decode JWT token and return payload
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token?: string | null): boolean {
    const tokenToCheck = token || this.getToken();
    
    if (!tokenToCheck) {
      return true;
    }

    try {
      const decoded = this.decodeToken(tokenToCheck);
      
      if (!decoded || !decoded.exp) {
        // Token format is invalid or doesn't have exp claim
        return true;
      }

      // exp is in seconds, Date.now() is in milliseconds
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();

      // Token is expired if current time is greater than expiration time
      // Add 5 second buffer to account for clock skew
      return currentTime >= (expirationTime - 5000);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Check if token is valid (exists and not expired)
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  /**
   * Remove token from localStorage (logout)
   */
  removeToken(): void {
    localStorage.removeItem('token');
  }
}

