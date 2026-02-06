import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BreadcrumbsService } from '../../services/breadcrumbs.service';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'vertex-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="v-breadcrumb">
      @for (item of breadcrumbsService.breadcrumbs(); track $index; let last = $last) {
        <div class="v-breadcrumb-item">
          @if (item.route && !last) {
            <a [routerLink]="item.route" class="v-breadcrumb-link">{{ item.label }}</a>
          } @else {
            <span class="v-breadcrumb-current">{{ item.label }}</span>
          }
          
          @if (!last) {
            <span class="v-breadcrumb-separator">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </span>
          }
        </div>
      }
    </nav>
  `,
  styles: [`
    .v-breadcrumb {
      display: flex;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      letter-spacing: 0.02em;
    }

    .v-breadcrumb-item {
      display: flex;
      align-items: center;
    }

    .v-breadcrumb-link {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.2s;
      
      &:hover {
        color: var(--text-main);
      }
    }

    .v-breadcrumb-current {
      color: var(--text-main);
      font-weight: 600;
    }

    .v-breadcrumb-separator {
      display: flex;
      align-items: center;
      color: var(--primary);
      margin: 0 0.5rem;
      
      svg {
        width: 12px;
        height: 12px;
      }
    }
  `]
})
export class VertexBreadcrumbComponent {
  breadcrumbsService = inject(BreadcrumbsService);
}
