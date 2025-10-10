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

  constructor(private apiService: ApiService) {
    this.loadStoredUser();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/api/v1/auth/login', { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.access_token);
          this.currentUserSubject.next(response.user);
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
    return this.apiService.get<User>('/api/v1/auth/me')
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private loadStoredUser(): void {
    const token = this.getToken();
    if (token) {
      // Validate the token with the backend and load user data
      this.getCurrentUser().subscribe({
        error: () => this.logout()
      });
    }
  }
}