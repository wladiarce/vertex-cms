import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  // Wait for validation to complete before making routing decision
  return auth.ensureValidated().pipe(
    map(isAuthenticated => {
      if (isAuthenticated) return true;
      
      // Not logged in? Redirect to login page
      return router.parseUrl('/admin/login');
    })
  );
};