import { Component, inject, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VertexClientService } from '../../services/vertex-client.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'vertex-collection-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white rounded-lg shadow p-6">
      <header class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold capitalize">{{ currentSlug() }}</h1>
        <button [routerLink]="['./create']" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create New
        </button>
      </header>

      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            
            @for (field of currentMetadata()?.fields; track field.name) {
               @if (!field.hidden) {
                 <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   {{ field.label || field.name }}
                 </th>
               }
            }
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          @for (doc of data()?.docs; track doc._id) {
            <tr class="hover:bg-gray-50" [routerLink]="['./', doc._id]">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                {{ doc._id | slice:0:6 }}...
              </td>
              
              @for (field of currentMetadata()?.fields; track field.name) {
                @if (!field.hidden) {
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ doc[field.name] }}
                  </td>
                }
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class CollectionListComponent {
  private route = inject(ActivatedRoute);
  private cms = inject(VertexClientService);

  // 1. Get the current slug from URL params (Reactive)
  // This updates whenever the URL changes
  currentSlug = toSignal(
    this.route.paramMap.pipe(map(params => params.get('slug')!))
  );

  // 2. Find the metadata for this slug (to know what columns to show)
  currentMetadata = computed(() => 
    this.cms.collections().find(c => c.slug === this.currentSlug())
  );

  // 3. Fetch data whenever slug changes
  data = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => this.cms.getAll(params.get('slug')!))
    )
  );
}