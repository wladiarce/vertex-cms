import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { FieldOptions } from '@vertex-cms/common';

@Component({
  selector: 'vertex-select-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-6">
      <div class="v-input-group">
        <label [for]="field.name">
          {{ field.label || field.name }}
          @if (field.required) {
            <span class="text-[var(--primary)]">*</span>
          }
        </label>
      </div>

      <!-- ── Multi-select (hasMany) ── -->
      @if (field.hasMany) {
        <div class="v-select-multi">
          <!-- Selected chips -->
          @if (selectedOptions().length > 0) {
            <div class="v-select-chips">
              @for (opt of selectedOptions(); track opt.value) {
                <span class="v-chip">
                  {{ opt.label }}
                  <button
                    type="button"
                    class="v-chip-remove"
                    [disabled]="isDisabled"
                    (click)="deselectOption(opt.value)"
                    aria-label="Remove {{ opt.label }}"
                  >×</button>
                </span>
              }
            </div>
          }

          <!-- Options list -->
          <div class="v-select-options" [class.v-select-invalid]="isInvalid">
            @for (opt of field.options ?? []; track opt.value) {
              <label
                class="v-select-option"
                [class.v-select-option--selected]="isSelected(opt.value)"
              >
                <input
                  type="checkbox"
                  class="v-select-check"
                  [checked]="isSelected(opt.value)"
                  [disabled]="isDisabled"
                  (change)="toggleOption(opt.value)"
                />
                <span class="v-select-option-label">{{ opt.label }}</span>
                @if (isSelected(opt.value)) {
                  <span class="v-select-tick">✓</span>
                }
              </label>
            }
            @if (!field.options?.length) {
              <div class="v-select-empty">No options defined</div>
            }
          </div>
        </div>

      } @else {
        <!-- ── Single-select ── -->
        <div class="v-select-wrapper" [class.v-select-invalid]="isInvalid">
          <select
            [id]="field.name"
            class="v-input v-select-native"
            [formControl]="control"
            [class.text-muted]="!control.value"
          >
            <option value="" disabled>
              — Select {{ field.label || field.name }} —
            </option>
            @for (opt of field.options ?? []; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
          <!-- Chevron icon -->
          <div class="v-select-arrow" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      }

      <!-- Validation error -->
      @if (isInvalid) {
        <p class="mt-2 font-mono text-xs text-[var(--primary)] flex items-center gap-1">
          <i data-lucide="alert-circle" class="w-3 h-3"></i>
          This field is required
        </p>
      }
    </div>
  `,
  styles: [`
    /* Single-select wrapper — positions the custom chevron */
    .v-select-wrapper {
      position: relative;

      &.v-select-invalid .v-input {
        border-color: var(--primary);
      }
    }

    .v-select-native {
      appearance: none;
      -webkit-appearance: none;
      padding-right: 2.5rem; /* room for arrow */
      cursor: pointer;

      option { font-family: var(--font-ui); }
    }

    .v-select-arrow {
      pointer-events: none;
      position: absolute;
      right: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      display: flex;
      align-items: center;
    }

    /* Multi-select */
    .v-select-multi {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .v-select-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .v-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.55rem;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 600;
      background: var(--bg-subtle);
      border: 1px solid var(--border-dim);
      border-radius: 2px;
      color: var(--text-main);
    }

    .v-chip-remove {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      font-size: 1rem;
      line-height: 1;
      padding: 0;
      display: flex;
      align-items: center;
      transition: color 0.15s;

      &:hover { color: var(--primary); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .v-select-options {
      border: 1px solid var(--border-dim);
      border-radius: var(--radius);
      background: var(--bg-input);
      overflow: hidden;

      &.v-select-invalid {
        border-color: var(--primary);
      }
    }

    .v-select-option {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.6rem 1rem;
      cursor: pointer;
      border-bottom: 1px solid var(--border-dim);
      font-size: 0.9rem;
      transition: background 0.12s;
      user-select: none;

      &:last-child { border-bottom: none; }
      &:hover { background: var(--bg-subtle); }

      &--selected {
        background: color-mix(in srgb, var(--primary) 6%, var(--bg-surface));
        color: var(--text-main);
        font-weight: 500;
      }
    }

    .v-select-check {
      /* visually hidden — we use our own indicator */
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .v-select-option-label {
      flex: 1;
    }

    .v-select-tick {
      font-size: 0.75rem;
      color: var(--primary);
      font-weight: 700;
    }

    .v-select-empty {
      padding: 0.75rem 1rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      font-style: italic;
    }
  `]
})
export class SelectFieldComponent {
  @Input({ required: true }) field!: FieldOptions & { name: string };
  @Input({ required: true }) group!: FormGroup;

  /** The underlying FormControl */
  get control(): FormControl {
    return this.group.get(this.field.name) as FormControl;
  }

  get isDisabled(): boolean {
    return this.control?.disabled ?? false;
  }

  get isInvalid(): boolean {
    const c = this.control;
    return !!(c && c.invalid && c.touched);
  }

  // ── Multi-select helpers ────────────────────────────────────────────────

  /** Current array value (always an array even if control holds a single value) */
  private get currentArray(): (string | number)[] {
    const v = this.control?.value;
    if (Array.isArray(v)) return v;
    if (v != null && v !== '') return [v];
    return [];
  }

  isSelected(value: string | number): boolean {
    return this.currentArray.includes(value);
  }

  toggleOption(value: string | number) {
    const arr = [...this.currentArray];
    const idx = arr.indexOf(value);
    if (idx === -1) {
      arr.push(value);
    } else {
      arr.splice(idx, 1);
    }
    this.control.setValue(arr);
    this.control.markAsDirty();
    this.control.markAsTouched();
  }

  deselectOption(value: string | number) {
    const arr = this.currentArray.filter(v => v !== value);
    this.control.setValue(arr);
    this.control.markAsDirty();
    this.control.markAsTouched();
  }

  /** Options objects for currently selected values — used to render chips */
  selectedOptions(): { label: string; value: string | number }[] {
    const opts = this.field.options ?? [];
    return this.currentArray
      .map(v => opts.find(o => o.value === v))
      .filter((o): o is { label: string; value: string | number } => o != null);
  }
}
