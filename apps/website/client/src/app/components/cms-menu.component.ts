import { Component, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsApiService, CmsMenu } from '../services/cms-api.service';
import { LocaleService } from '../services/locale.service';

/**
 * CMS-driven Menu Component
 * Fetches menu by handle and renders it with support for:
 * - 2-level nesting (dropdowns)
 * - Orientation (horizontal/vertical)
 * - Custom CSS classes per item
 * - Render as button option
 * - Localized labels (handled by API)
 */
@Component({
  selector: 'app-cms-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (menu(); as m) {
      <nav class="cms-menu" [class.cms-menu--vertical]="orientation === 'vertical'">
        <ul class="menu-list">
          @for (item of m.items; track $index) {
            <li class="menu-item" 
                [class.menu-item--has-children]="item.children?.length" 
                [class.menu-item--button]="item.button">
              
              <a 
                [routerLink]="item.url != '' ? item.url : null" 
                [attr.target]="item.openInNewTab ? '_blank' : null"
                [class.menu-link]="!item.button"
                [class]="item.class || ''"
                [class.v-btn]="item.button"
                [class.primary]="item.button"
                routerLinkActive="active"
              >
                {{ locale.translate(item.label) }}
                @if (item.children?.length) {
                  <span class="dropdown-icon">▾</span>
                }
              </a>

              @if (item.children?.length) {
                <ul class="submenu">
                  @for (child of item.children; track $index) {
                    <li class="submenu-item">
                      <a 
                        [routerLink]="child.url"
                        [attr.target]="child.openInNewTab ? '_blank' : null"
                        class="submenu-link"
                        routerLinkActive="active"
                      >
                        {{ locale.translate(child.label) }}
                      </a>
                    </li>
                  }
                </ul>
              }
            </li>
          }
        </ul>
      </nav>
    }
  `,
  styles: [`
    :host { display: block; }
    
    .menu-list {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .cms-menu--vertical .menu-list {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .menu-item {
      position: relative;
      cursor: pointer;
    }

    .menu-link {
      padding: 0.35rem 0.6rem;
      text-decoration: none;
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 500;
      border-radius: var(--radius);
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      white-space: nowrap;
      border: 1px solid transparent;

      &:hover, &.active {
        color: var(--text-main);
        background: var(--bg-subtle);
      }
    }

    /* If it's a vertex button, it uses global .v-btn styles from app.scss */
    .menu-item--button {
      .menu-link {
        /* reset default link padding if it's a button */
        padding: 0.5rem 0.9rem;
      }
    }

    .dropdown-icon {
      font-size: 0.75rem;
      opacity: 0.7;
    }

    // TODO: HANDLE MENU RESPONSIVENESS (hide menu, add toggle to nav to open a dropdown)
    // @media (max-width: 640px) {
    //   .nav-text-links {
    //     display: none;
    //   }
    // }

    /* ── Dropdown (Horizontal) ─────────────────────────────────────────── */
    .submenu {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-depth);
      min-width: 180px;
      z-index: 200;
      border-radius: var(--radius);
      list-style: none;
      padding: 0;
      margin-top: 2px;
    }

    .menu-item:hover .submenu {
      display: block;
    }

    .submenu-link {
      display: block;
      padding: 0.6rem 1rem;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      border-bottom: 1px solid var(--border-dim);
      transition: all 0.15s;

      &:hover, &.active {
        background: var(--bg-subtle);
        color: var(--text-main);
      }
    }

    .submenu-item:last-child .submenu-link {
      border-bottom: none;
    }

    /* ── Vertical Mode Adjustments ─────────────────────────────────────── */
    .cms-menu--vertical {
      .submenu {
        position: static;
        display: block;
        box-shadow: none;
        border: none;
        padding-left: 1rem;
        margin-top: 0;
      }
      .submenu-link {
        border-bottom: none;
        padding: 0.3rem 0.6rem;
      }
    }
  `]
})
export class CmsMenuComponent implements OnInit {
  private api = inject(CmsApiService);
  protected locale = inject(LocaleService);

  @Input() handle!: string;
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

  menu = signal<CmsMenu | null>(null);

  ngOnInit() {
    if (this.handle) {
      this.api.getMenu(this.handle).subscribe(menu => {
        this.menu.set(menu);
      });
    }
  }
}
