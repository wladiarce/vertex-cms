import { Component, input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'vertex-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VertexSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="v-select-wrapper">
      @if (label()) {
        <label [for]="inputId" class="v-select-label">{{ label() }}</label>
      }
      <div class="v-select-container">
        <select
          [id]="inputId"
          class="v-select"
          [disabled]="disabled()"
          [value]="value"
          (change)="onSelectChange($event)"
          (blur)="onTouched()"
        >
          <ng-content></ng-content>
        </select>
        <i data-lucide="chevron-down" class="v-select-icon"></i>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .v-select-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .v-select-label {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 600;
      color: var(--text-muted);
    }

    .v-select-container {
      position: relative;
      display: inline-flex;
      align-items: center;
    }

    .v-select {
      appearance: none;
      height: 2.5rem;
      min-width: 150px;
      padding: 0 2.5rem 0 1rem;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 500;
      background: var(--bg-input);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius);
      color: var(--text-main);
      outline: none;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      line-height: 1;
    }

    .v-select:hover {
      border-color: var(--border);
    }

    .v-select:focus {
      border-color: var(--primary);
      background: var(--bg-surface);
      box-shadow: 2px 2px 0px rgba(255, 79, 0, 0.2);
    }

    .v-select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .v-select-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      color: var(--text-muted);
      pointer-events: none;
    }
  `]
})
export class VertexSelectComponent implements ControlValueAccessor {
  label = input<string>('');
  disabled = input<boolean>(false);

  value: string = '';
  onChange: any = () => {};
  onTouched: any = () => {};

  // Generate unique ID for select/label association
  inputId = `vertex-select-${Math.random().toString(36).slice(2, 9)}`;

  onSelectChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Handle disabled state if needed
  }
}
