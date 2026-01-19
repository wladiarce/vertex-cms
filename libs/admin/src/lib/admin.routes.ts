import { Route } from '@angular/router';
import { AdminLayoutComponent } from './components/layout/admin-layout.component';
import { CollectionListComponent } from './pages/collection-list/collection-list.component';
import { inject } from '@angular/core';
import { VertexClientService } from './services/vertex-client.service';

export const adminRoutes: Route[] = [
  {
    path: '', // The base path '/admin'
    component: AdminLayoutComponent,
    resolve: {
      // Before loading the admin, fetch the config!
      config: () => inject(VertexClientService).loadConfig()
    },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        // The Magic Dynamic Route
        path: 'collections/:slug',
        component: CollectionListComponent
      }
    ]
  }
];