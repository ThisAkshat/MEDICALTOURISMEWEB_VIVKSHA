import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse, SignupRequest, SignupResponse, ForgotPasswordRequest, ForgotPasswordResponse, User } from '../../shared/interfaces/api.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly TOKEN_KEY = 'auth_token';
  private readonly SESSION_TOKEN_KEY = 'session_auth_token';
  private userLoaded = false;

  constructor(private apiService: ApiService) {
    // Don't auto-load user on service initialization
    // Let components handle it explicitly
    console.log('🏁 AuthService constructor - checking localStorage...');
    console.log('🌐 Current URL:', window.location.href);
    console.log('🔐 localStorage available:', typeof localStorage !== 'undefined');
    
    const token = this.getToken();
    if (token) {
      console.log('🔑 Token found in localStorage on init:', token.substring(0, 30) + '...');
      // Immediately emit that we have a token (optimistic update)
      // The actual user data will be loaded when component calls loadStoredUser
    } else {
      console.log('❌ No token found in localStorage');
      console.log('📋 All localStorage keys:', Object.keys(localStorage));
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/api/v1/auth/login', { email, password })
      .pipe(
        tap(response => {
          console.log('✅ Login successful, storing token');
          try {
            // Store in both localStorage and sessionStorage as backup
            localStorage.setItem(this.TOKEN_KEY, response.access_token);
            sessionStorage.setItem(this.SESSION_TOKEN_KEY, response.access_token);
            
            // Also store in cookie as additional backup
            document.cookie = `auth_token=${response.access_token}; path=/; max-age=31536000; SameSite=Lax`;
            
            console.log('💾 Token stored in localStorage');
            console.log('💾 Token stored in sessionStorage');
            console.log('💾 Token stored in cookie');
            console.log('🔍 Verifying token was saved:', localStorage.getItem(this.TOKEN_KEY) ? 'YES' : 'NO');
          } catch (e) {
            console.error('❌ Failed to save token:', e);
          }
          this.currentUserSubject.next(response.user);
          this.userLoaded = true;
        })
      );
  }

  signup(signupData: SignupRequest): Observable<SignupResponse> {
    return this.apiService.post<SignupResponse>('/api/v1/auth/signup', signupData);
    // Note: We don't auto-login after signup to encourage email verification
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.apiService.post<ForgotPasswordResponse>('/api/v1/auth/forgot-password', { email });
  }

  getCurrentUser(): Observable<User> {
    console.log('📡 Calling /api/v1/auth/me endpoint');
    return this.apiService.get<User>('/api/v1/auth/me')
      .pipe(
        tap(user => {
          console.log('✅ User data loaded:', user);
          this.currentUserSubject.next(user);
          this.userLoaded = true;
        })
      );
  }

  logout(): void {
    console.log('🚪 Logging out, removing token');
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.SESSION_TOKEN_KEY);
    document.cookie = 'auth_token=; path=/; max-age=0';
    this.currentUserSubject.next(null);
    this.userLoaded = false;
  }

  getToken(): string | null {
    // Try localStorage first
    let token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      console.log('🔑 Token found in localStorage');
      return token;
    }
    
    // Try sessionStorage as backup
    token = sessionStorage.getItem(this.SESSION_TOKEN_KEY);
    if (token) {
      console.log('🔑 Token found in sessionStorage, restoring to localStorage');
      localStorage.setItem(this.TOKEN_KEY, token);
      return token;
    }
    
    // Try cookie as last resort
    const cookieToken = this.getTokenFromCookie();
    if (cookieToken) {
      console.log('🔑 Token found in cookie, restoring to localStorage');
      localStorage.setItem(this.TOKEN_KEY, cookieToken);
      sessionStorage.setItem(this.SESSION_TOKEN_KEY, cookieToken);
      return cookieToken;
    }
    
    return null;
  }
  
  private getTokenFromCookie(): string | null {
    const name = 'auth_token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
      let c = cookieArray[i].trim();
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isUserLoaded(): boolean {
    return this.userLoaded;
  }

  // Public method to load user - called explicitly by components
  loadStoredUser(): void {
    const token = this.getToken();
    console.log('🔍 Loading stored user, token exists:', !!token);
    if (token) {
      // Validate the token with the backend and load user data
      this.getCurrentUser().subscribe({
        next: () => {
          console.log('✅ User loaded successfully from token');
          this.userLoaded = true;
        },
        error: (err) => {
          console.error('❌ Failed to load user from token:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.error);
          
          // Only logout on 401 (invalid token), not on 403 (forbidden/permission issue)
          if (err.status === 401) {
            console.log('🚪 Invalid token (401), logging out');
            this.logout();
          } else if (err.status === 403) {
            console.log('⚠️ Token valid but access forbidden (403) - keeping user logged in');
            // Keep the token but show a message that email verification might be needed
          }
        }
      });
    }
  }
}