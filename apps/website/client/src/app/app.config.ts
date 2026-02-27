import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withEnabledBlockingInitialNavigation, withRouterConfig } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from '@vertex-cms/admin';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideClientHydration(withEventReplay()),
    provideClientHydration(),
    // provideBrowserGlobalErrorListeners(),
    // HttpClient with fetch adapter (required for SSR) + JWT auth interceptor for admin
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    // provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      // withEnabledBlockingInitialNavigation(),
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      })
    ),
  ],
};
