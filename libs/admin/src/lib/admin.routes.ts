import { Route } from '@angular/router';
import { AdminLayoutComponent } from './components/layout/admin-layout.component';
import { CollectionListComponent } from './pages/collection-list/collection-list.component';
import { inject } from '@angular/core';
import { VertexClientService } from './services/vertex-client.service';
import { CollectionEditComponent } from './pages/collection-edit/collection-edit.component';
import { authGuard } from './auth/auth.guard';
import { LoginComponent } from './pages/login/login.component';

export const adminRoutes: Route[] = [
  // LOGIN - public
  {
    path: 'login',
    component: LoginComponent
  },
  // ADMIN DASHBOARD - private
  {
    path: '', // The base path '/admin'
    component: AdminLayoutComponent,
    canActivate: [authGuard],
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
      },
      {
        // The Magic Dynamic Route
        path: 'collections/:slug/create',
        component: CollectionEditComponent
      },
      {
        // The Magic Dynamic Route
        path: 'collections/:slug/:id',
        component: CollectionEditComponent
      }
    ]
  }
];