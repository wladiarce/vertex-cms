import { Component, input, output, OnInit, signal, effect, AfterViewInit, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Declare lucide globally
declare const lucide: any;

export interface VertexTab {
  id: string;
  label: string;
  badge?: string | number;
  disabled?: boolean;
}

@Component({
  selector: 'vertex-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vertex-tabs">
      <!-- Tab buttons -->
      <div class="flex gap-2 border-b border-[var(--border-dim)]">
        @for (tab of tabs(); track tab.id) {
          <button
            type="button"
            (click)="selectTab(tab.id)"
            [disabled]="tab.disabled"
            [class]="getTabClasses(tab.id)"
            class="px-4 py-2 font-mono text-xs font-semibold uppercase relative transition-all"
          >
            {{ tab.label }}
            
            @if (tab.badge !== undefined && tab.badge !== null) {
              <span class="ml-2 px-1.5 py-0.5 bg-[var(--border-dim)] text-[10px] rounded">
                {{ tab.badge }}
              </span>
            }
          </button>
        }
      </div>

      <!-- Tab content container -->
      <div class="tab-content-wrapper border border-[var(--border-dim)] border-t-0 bg-[var(--bg-input)] p-4">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class VertexTabsComponent implements AfterViewInit {
  private elementRef = inject(ElementRef);

  tabs = input.required<VertexTab[]>();
  activeTab = input<string>('');
  activeTabChange = output<string>();

  private internalActiveTab = signal<string>('');

  constructor() {
    // Initialize active tab
    effect(() => {
      const tabs = this.tabs();
      const activeTab = this.activeTab();
      
      if (activeTab) {
        this.internalActiveTab.set(activeTab);
      } else if (tabs.length > 0) {
        // Default to first non-disabled tab
        const firstEnabled = tabs.find(t => !t.disabled);
        if (firstEnabled) {
          this.internalActiveTab.set(firstEnabled.id);
        }
      }
    });
  }

  ngAfterViewInit() {
    // Initialize Lucide icons after view init
    if (typeof lucide !== 'undefined') {
      try {
        lucide.createIcons({ nameAttr: 'data-lucide' });
      } catch (e) {
        console.warn('Lucide icons not initialized:', e);
      }
    }
  }

  selectTab(tabId: string) {
    const tab = this.tabs().find(t => t.id === tabId);
    if (tab && !tab.disabled) {
      this.internalActiveTab.set(tabId);
      this.activeTabChange.emit(tabId);
    }
  }

  getTabClasses(tabId: string): string {
    const isActive = this.internalActiveTab() === tabId;
    const baseClasses = 'border-b-2 ';
    
    if (isActive) {
      return baseClasses + 'border-[var(--primary)] text-[var(--primary)] bg-[var(--bg-subtle)]';
    }
    
    return baseClasses + 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-dim)]';
  }
}
