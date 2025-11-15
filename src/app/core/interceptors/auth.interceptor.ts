import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  //console.log('🔐 Auth Interceptor called for:', req.url);

  // Prepare headers object
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Add authorization header if token exists
  if (token) {
    //console.log('🎫 Token found, adding Authorization header');
    //console.log('🔑 Token (first 50 chars):', token.substring(0, 50) + '...');
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    //console.log('📭 No token available');
  }

  // Clone the request with all headers
  const modifiedReq = req.clone({
    setHeaders: headers
  });

  //console.log('📤 Request headers:', modifiedReq.headers.keys());

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        console.error('Client-side error:', error.error.message);
      } else {
        // Server-side error
        console.error(`Server-side error: ${error.status} - ${error.message}`);
        console.error('Request URL:', req.url);

        // Handle specific error cases
        switch (error.status) {
          case 401:
            // Only auto-logout for 401 if it's NOT the /auth/me endpoint
            if (!req.url.includes('/auth/me')) {
              //console.log('🚪 401 error - logging out user');
              authService.logout();
            } else {
              //console.log('⚠️ 401 error on /auth/me - token validation failed');
            }
            break;
          case 403:
            // Don't auto-logout on 403 for /auth/me
            if (req.url.includes('/auth/me')) {
              //console.log('⚠️ 403 Forbidden on /auth/me - possible email verification required');
            } else {
              //console.log('⚠️ 403 Forbidden - access denied');
            }
            break;
        }
      }

      return throwError(() => error);
    })
  );
};
