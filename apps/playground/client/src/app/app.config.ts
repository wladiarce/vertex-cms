import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { adminRoutes, authInterceptor } from '@vertex/admin';
import { VertexRegistryService } from '@vertex/public';

import { HeroComponent } from './components/hero/hero.component';
import { TextComponent } from './components/text/text.component';
import { PublicPageComponent } from './pages/public-page/public-page.component';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { ImageComponent } from './components/image/image.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideRouter(
      [
        {
          path: 'admin',
          children: adminRoutes, // loads @vertex/admin library
        },
        {
          // Catch-All for public pages
          path: '**',
          component: PublicPageComponent,
        },
      ],
      withComponentInputBinding(),
      withRouterConfig({
        paramsInheritanceStrategy: 'always'
      })
    ),
    provideAppInitializer(() => {
      const registryService = inject(VertexRegistryService);
      registryService.register('hero', HeroComponent);
      registryService.register('text-simple', TextComponent);
      registryService.register('image', ImageComponent);
      return;
    }),
  ],
};
