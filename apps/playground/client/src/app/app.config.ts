import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { adminRoutes, authInterceptor } from '@vertex/admin';
import { AuthService, initializeAuth } from 'libs/admin/src/lib/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideRouter([
      {
        path: 'admin',
        children: adminRoutes // loads @vertex/admin library
      },
      {
        path: '',
        redirectTo: 'admin',
        pathMatch: 'full'
      }
    ], withComponentInputBinding()),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return initializeAuth(authService);
    })
  ],
};