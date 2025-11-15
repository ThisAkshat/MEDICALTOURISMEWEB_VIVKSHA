import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the auth token
    const token = this.authService.getToken();
    
    // Prepare headers object
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add authorization header if token exists
    if (token) {
      //console.log('🔐 Adding token to request:', request.url);
      //console.log('🎫 Token (first 50 chars):', token.substring(0, 50) + '...');
      headers['Authorization'] = `Bearer ${token}`;
      //console.log('✅ Authorization header will be added');
    } else {
      //console.log('📭 No token available for request:', request.url);
    }

    // Clone the request with all headers at once
    const modifiedRequest = request.clone({
      setHeaders: headers
    });

    //console.log('📤 Final request headers:', modifiedRequest.headers.keys());

    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          console.error('Client-side error:', error.error.message);
        } else {
          // Server-side error
          console.error(`Server-side error: ${error.status} - ${error.message}`);
          console.error('Request URL:', request.url);
          
          // Handle specific error cases
          switch (error.status) {
            case 401:
              // Only auto-logout for 401 if it's NOT the /auth/me endpoint
              // (Let the auth service handle /auth/me 401 explicitly)
              if (!request.url.includes('/auth/me')) {
                //console.log('🚪 401 error - logging out user');
                this.authService.logout();
              } else {
                //console.log('⚠️ 401 error on /auth/me - token validation failed');
              }
              break;
            case 403:
              // Don't auto-logout on 403 for /auth/me - might be email verification issue
              if (request.url.includes('/auth/me')) {
                //console.log('⚠️ 403 Forbidden on /auth/me - possible email verification required or permission issue');
              } else {
                //console.log('⚠️ 403 Forbidden - access denied');
              }
              break;
            case 404:
              // Handle not found
              break;
            case 500:
              // Handle server error
              break;
          }
        }
        
        return throwError(() => error);
      })
    );
  }
}