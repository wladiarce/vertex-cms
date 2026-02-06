import { Route, RouterOutlet } from '@angular/router';
import { AdminLayoutComponent } from './components/layout/admin-layout.component';
import { CollectionListComponent } from './pages/collection-list/collection-list.component';
import { inject, Component } from '@angular/core';
import { VertexClientService } from './services/vertex-client.service';
import { CollectionEditComponent } from './pages/collection-edit/collection-edit.component';
import { authGuard } from './auth/auth.guard';
import { LoginComponent } from './pages/login/login.component';

@Component({
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class RouteOutletComponent {}

export const adminRoutes: Route[] = [
  // LOGIN - public
  {
    path: 'login',
    component: LoginComponent,

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
        data: {
          breadcrumb: {
            label: 'Vertex CMS'
          }
        },
        children: [
          // ROOT - REDIRECT
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          // DASHBOARD
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
            data: {
              breadcrumb: {
                label: ''
              }
            }
          },
          // MEDIA
          {
            path: 'media',
            loadComponent: () => import('./pages/media-library/media-library.component').then(m => m.MediaLibraryComponent),
            data: {
              breadcrumb: {
                label: 'Media Library'
              }
            }
          },
          // COLLECTION
          {
            path: 'collections/:slug',
            component: RouteOutletComponent,
            data: {
              breadcrumb: {
                label: ':slug'
              }
            },
            children: [
              // COLLECTION LIST
              {
                path: '',
                component: CollectionListComponent,
                data: {
                  breadcrumb: {
                    label: null
                  }
                }
              },
              // COLLECTION CREATE
              {
                path: 'create',
                component: CollectionEditComponent,
                data: {
                  breadcrumb: {
                    label: 'Create New'
                  }
                }
              },
              // COLLECTION EDIT
              {
                path: ':id',
                component: CollectionEditComponent,
                data: {
                  breadcrumb: {
                    label: 'Edit'
                  }
                }
              }
            ]
          },
          {
            // Cath all: 404 not found -> for the moment goes to dashboard
            path: '**',
            redirectTo: 'dashboard'
          }
        ]
      }
    ]
  }
];