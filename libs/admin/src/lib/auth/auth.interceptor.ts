import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let request = req;

  if (token) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // 1. Check if it's a 401 Unauthorized error
      if (error.status === 401) {
        // 2. Force logout (clears token & redirects)
        authService.logout();
      }
      
      // 3. Propagate error so components can still show messages if needed
      return throwError(() => error);
    })
  );
};