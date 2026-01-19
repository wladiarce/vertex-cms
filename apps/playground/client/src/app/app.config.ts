import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { adminRoutes } from '@vertex/admin';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()), // Essential for APIs
    provideRouter([
      {
        path: 'admin',
        children: adminRoutes // Mount the Admin library here
      },
      {
        path: '',
        redirectTo: 'admin',
        pathMatch: 'full'
      }
    ], withComponentInputBinding()) 
  ],
};