import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { VertexClientService } from '../../services/vertex-client.service';

@Component({
  selector: 'vertex-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-100">
      <aside class="w-64 bg-gray-900 text-white flex flex-col">
        <div class="p-6 text-xl font-bold tracking-wider">
          VERTEX <span class="text-blue-400">CMS</span>
        </div>
        
        <nav class="flex-1 px-4 space-y-2 mt-4">
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Collections
          </div>

          @for (col of cms.collections(); track col.slug) {
            <a [routerLink]="['/admin/collections', col.slug]"
               routerLinkActive="bg-gray-800 text-blue-400"
               class="block px-4 py-2 rounded transition-colors hover:bg-gray-800">
               {{ col.pluralName || col.slug }}
            </a>
          }
        </nav>
      </aside>

      <main class="flex-1 overflow-auto p-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})

export class AdminLayoutComponent {
  cms = inject(VertexClientService);
}