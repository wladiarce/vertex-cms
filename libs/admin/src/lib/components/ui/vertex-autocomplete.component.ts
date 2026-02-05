import { Component, input, output, forwardRef, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface AutocompleteItem {
  id: string | number;
  displayName: string;
  [key: string]: any;
}

@Component({
  selector: 'vertex-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => VertexAutocompleteComponent),
    multi: true
  }],
  template: `
    <div class="v-autocomplete">
      @if (label()) {
        <label [for]="inputId">{{ label() }}</label>
      }
      
      <div class="v-autocomplete-input-wrapper">
        <input
          #searchInput
          [id]="inputId"
          type="text"
          class="v-input"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
          autocomplete="off"
        />
        
        <!-- Selected items (multiple mode) -->
        @if (multiple() && selectedItems().length > 0) {
          <div class="v-autocomplete-chips">
            @for (item of selectedItems(); track item.id) {
              <span class="v-chip">
                {{ item.displayName }}
                <button type="button" (click)="removeItem(item)" class="v-chip-remove">
                  ×
                </button>
              </span>
            }
          </div>
        }
      </div>
      
      <!-- Dropdown -->
      @if (showDropdown() && (items().length > 0 || loading() || emptyMessage())) {
        <div class="v-autocomplete-dropdown">
          @if (loading()) {
            <div class="v-autocomplete-item loading">Searching...</div>
          } @else if (items().length === 0 && emptyMessage()) {
            <div class="v-autocomplete-item empty">{{ emptyMessage() }}</div>
          } @else {
            @for (item of items(); track item.id; let i = $index) {
              <div
                class="v-autocomplete-item"
                [class.highlighted]="highlightedIndex() === i"
                (mousedown)="selectItem(item)"
                (mouseenter)="highlightedIndex.set(i)"
              >
                {{ item.displayName }}
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class VertexAutocompleteComponent implements ControlValueAccessor {
  // Inputs
  label = input<string>('');
  placeholder = input<string>('Search...');
  disabled = input<boolean>(false);
  multiple = input<boolean>(false);
  emptyMessage = input<string>('No results found');
  items = input<AutocompleteItem[]>([]);
  loading = input<boolean>(false);
  
  // Outputs
  search = output<string>();
  
  // State
  searchQuery = '';
  showDropdown = signal(false);
  highlightedIndex = signal(-1);
  selectedItems = signal<AutocompleteItem[]>([]);
  
  private searchSubject = new Subject<string>();
  private onChange: any = () => {};
  private onTouched: any = () => {};
  
  inputId = `vertex-autocomplete-${Math.random().toString(36).substr(2, 9)}`;
  
  constructor() {
    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.search.emit(query);
    });
  }
  
  onSearchChange(query: string) {
    this.searchSubject.next(query);
    if (query.length > 0) {
      this.showDropdown.set(true);
    }
  }
  
  onFocus() {
    if (this.searchQuery.length > 0) {
      this.showDropdown.set(true);
    }
  }
  
  onBlur() {
    setTimeout(() => this.showDropdown.set(false), 200);
    this.onTouched();
  }
  
  onKeyDown(event: KeyboardEvent) {
    const itemCount = this.items().length;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex.update(i => Math.min(i + 1, itemCount - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex.update(i => Math.max(i - 1, -1));
        break;
      case 'Enter':
        event.preventDefault();
        const idx = this.highlightedIndex();
        if (idx >= 0 && idx < itemCount) {
          this.selectItem(this.items()[idx]);
        }
        break;
      case 'Escape':
        this.showDropdown.set(false);
        break;
    }
  }
  
  selectItem(item: AutocompleteItem) {
    if (this.multiple()) {
      // Add to selected items
      if (!this.selectedItems().find(i => i.id === item.id)) {
        this.selectedItems.update(items => [...items, item]);
        this.emitValue();
      }
      this.searchQuery = '';
    } else {
      // Single selection
      this.searchQuery = item.displayName;
      this.selectedItems.set([item]);
      this.showDropdown.set(false);
      this.emitValue();
    }
    this.highlightedIndex.set(-1);
  }
  
  removeItem(item: AutocompleteItem) {
    this.selectedItems.update(items => items.filter(i => i.id !== item.id));
    this.emitValue();
  }
  
  private emitValue() {
    const selected = this.selectedItems();
    if (this.multiple()) {
      this.onChange(selected.map(i => i.id));
    } else {
      this.onChange(selected[0]?.id || null);
    }
  }
  
  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (!value) {
      this.selectedItems.set([]);
      this.searchQuery = '';
      return;
    }

    // Handle both populated objects and plain IDs
    if (this.multiple()) {
      // value could be: ['id1', 'id2'] or [{_id: 'id1', name: 'Name1'}, ...]
      const items = Array.isArray(value) ? value : [value];
      this.selectedItems.set(items.map(item => this.toAutocompleteItem(item)));
    } else {
      // value could be: 'id' or {_id: 'id', name: 'Name'}
      const item = this.toAutocompleteItem(value);
      this.selectedItems.set([item]);
      this.searchQuery = item.displayName;
    }
  }

  private toAutocompleteItem(value: any): AutocompleteItem {
    // If it's already an object with _id, treat it as populated
    if (typeof value === 'object' && value._id) {
      return {
        id: value._id,
        displayName: value.title || value.name || value._id,
        ...value
      };
    }
    
    // If it's a string ID, create a basic item (will show ID until data loads)
    return {
      id: value,
      displayName: value // Fallback to ID if we don't have the name yet
    };
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state
  }
}
