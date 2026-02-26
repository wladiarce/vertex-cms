import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { FieldOptions, BlockMetadata, RepeaterMetadata } from '@vertex-cms/common';
import { FieldRendererComponent } from '../form/field-renderer.component';
import { LocaleService } from '../../services/locale.service';

/** The resolved shape of a repeater field as received from the API */
type ResolvedRepeaterField = Omit<FieldOptions, 'blocks'> & {
  name: string;
  blocks?: BlockMetadata[];
  repeaterFields?: RepeaterMetadata;
};

@Component({
  selector: 'vertex-repeater-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FieldRendererComponent],
  template: `
    <div class="mb-6">

      <!-- Label -->
      <div class="v-input-group mb-3">
        <label>
          {{ field.label || field.name }}
          @if (field.required) { <span class="rep-required">*</span> }
        </label>
      </div>

      <!-- Rows -->
      <div [formGroup]="parentForm">
        <div [formArrayName]="field.name" class="rep-list">

          @for (control of formArray.controls; track control; let i = $index) {
            <div [formGroupName]="i" class="rep-row" [class.rep-row--expanded]="isExpanded(i)">

              <!-- Row header -->
              <div class="rep-row-header" (click)="toggleRow(i)">
                <div class="rep-row-left">
                  <span class="rep-index">#{{ i }}</span>
                  <span class="rep-preview">{{ getRowPreview(i) }}</span>
                </div>
                <div class="rep-row-actions">
                  <button type="button" class="rep-action-btn"
                          title="Move up" [disabled]="i === 0"
                          (click)="moveRow(i, -1); $event.stopPropagation()">▲</button>
                  <button type="button" class="rep-action-btn"
                          title="Move down" [disabled]="i === formArray.length - 1"
                          (click)="moveRow(i, 1); $event.stopPropagation()">▼</button>
                  <button type="button" class="rep-action-btn rep-action-btn--danger"
                          title="Remove row"
                          (click)="removeRow(i); $event.stopPropagation()">Remove</button>
                  <span class="rep-chevron">{{ isExpanded(i) ? '▲' : '▼' }}</span>
                </div>
              </div>

              <!-- Row fields (collapsible) -->
              @if (isExpanded(i)) {
                <div class="rep-row-body">
                  @for (subField of rowFields; track subField.name) {
                    <vertex-field-renderer [field]="subField" [group]="asGroup(control)" />
                  }
                </div>
              }

            </div>
          }

          <!-- Empty state -->
          @if (formArray.length === 0) {
            <div class="rep-empty">No items yet. Click <strong>+ Add row</strong> to begin.</div>
          }

        </div>
      </div>

      <!-- Add row -->
      <div class="rep-add-bar">
        <button type="button" class="rep-add-btn" (click)="addRow()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add row
        </button>
      </div>

    </div>
  `,
  styles: [`
    /* ── Required mark ──────────────────────────────────────────────── */
    .rep-required { color: var(--primary); margin-left: 2px; }

    /* ── Row list ───────────────────────────────────────────────────── */
    .rep-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* ── Individual row ─────────────────────────────────────────────── */
    .rep-row {
      border: 1px solid var(--border-dim);
      border-radius: var(--radius);
      background: var(--bg-input);
      overflow: hidden;
      transition: border-color 0.15s;

      &--expanded {
        border-color: var(--primary);
      }
    }

    .rep-row-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 0.9rem;
      cursor: pointer;
      background: var(--bg-subtle);
      user-select: none;
      gap: 1rem;

      &:hover { background: var(--bg-input); }
    }

    .rep-row-left {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      overflow: hidden;
    }

    .rep-index {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-muted);
      background: var(--border-dim);
      padding: 0.1rem 0.4rem;
      border-radius: 2px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .rep-preview {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .rep-row-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .rep-action-btn {
      background: none;
      border: 1px solid var(--border-dim);
      border-radius: 2px;
      padding: 0.2rem 0.5rem;
      font-family: var(--font-mono);
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.12s;

      &:hover:not(:disabled) {
        color: var(--text-main);
        border-color: var(--border);
      }

      &:disabled { opacity: 0.3; cursor: not-allowed; }

      &--danger {
        color: var(--primary);
        &:hover:not(:disabled) {
          background: color-mix(in srgb, var(--primary) 8%, transparent);
          border-color: var(--primary);
        }
      }
    }

    .rep-chevron {
      font-size: 0.6rem;
      color: var(--text-muted);
    }

    /* ── Row body ───────────────────────────────────────────────────── */
    .rep-row-body {
      padding: 1rem;
      background: var(--bg-surface);
      border-top: 1px solid var(--border-dim);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    /* ── Empty state ────────────────────────────────────────────────── */
    .rep-empty {
      text-align: center;
      padding: 1.5rem 1rem;
      color: var(--text-muted);
      font-size: 0.82rem;
      border: 1px dashed var(--border-dim);
      border-radius: var(--radius);
      background: var(--bg-subtle);
    }

    /* ── Add row bar ────────────────────────────────────────────────── */
    .rep-add-bar {
      margin-top: 8px;
    }

    .rep-add-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      height: 30px;
      padding: 0 0.85rem;
      background: none;
      border: 1px solid var(--border-dim);
      border-radius: 2px;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.12s;

      &:hover {
        color: var(--primary);
        border-color: var(--primary);
        background: color-mix(in srgb, var(--primary) 5%, transparent);
      }
    }
  `]
})
export class RepeaterFieldComponent implements OnInit {
  @Input({ required: true }) field!: ResolvedRepeaterField;
  @Input({ required: true }) group!: FormGroup;

  private fb = inject(FormBuilder);
  private localeService = inject(LocaleService);

  expandedRows = signal<Set<number>>(new Set());

  // ── Helpers ──────────────────────────────────────────────────────────────

  get parentForm(): FormGroup { return this.group; }

  get formArray(): FormArray {
    return this.group.get(this.field.name) as FormArray;
  }

  /** The sub-fields that every row renders */
  get rowFields(): (FieldOptions & { name: string; blocks?: BlockMetadata[]; repeaterFields?: RepeaterMetadata })[] {
    return (this.field.repeaterFields?.fields ?? []) as (FieldOptions & { name: string; blocks?: BlockMetadata[]; repeaterFields?: RepeaterMetadata })[];
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit() {
    // Ensure FormArray control exists and is the right type
    const ctrl = this.group.get(this.field.name);
    if (!ctrl || !(ctrl instanceof FormArray)) {
      // If it exists but it's not a FormArray (e.g. stale data from previous version),
      // we must replace it so this component can function.
      this.group.setControl(this.field.name, this.fb.array([]));
    }

    // Rebuild from existing data (edit mode)
    const existing = this.group.get(this.field.name)?.value;
    if (Array.isArray(existing) && existing.length > 0 && this.formArray.length === 0) {
      existing.forEach((item: any) => {
        this.formArray.push(this.createRowGroup(item));
      });
      // Auto-expand the first row
      this.expandedRows.update(s => new Set(s).add(0));
    }
  }

  // ── Row CRUD ─────────────────────────────────────────────────────────────

  createRowGroup(data: any = {}): FormGroup {
    const controls: Record<string, any> = {};
    for (const f of this.rowFields) {
      if (f.type === 'blocks' || f.type === 'repeater') {
        controls[f.name] = this.fb.array([]);
      } else if (f.localized) {
        // Handle localized fields inside repeaters
        const localeControls: any = {};
        const supportedLocales = this.localeService.getSupportedLocales()();
        const localeData = data[f.name] || {};
        
        supportedLocales.forEach(locale => {
          localeControls[locale] = [localeData[locale] || ''];
        });
        
        const validators = f.required ? [Validators.required] : [];
        controls[f.name] = this.fb.group(localeControls, { validators });
      } else {
        const validators = f.required ? [Validators.required] : [];
        // Boolean fields default to false, others to empty string or provided value
        const defaultVal = f.type === 'boolean' ? false : '';
        controls[f.name] = [data[f.name] ?? defaultVal, validators];
      }
    }
    return this.fb.group(controls);
  }

  addRow() {
    const idx = this.formArray.length;
    this.formArray.push(this.createRowGroup());
    // Auto-expand the new row
    this.expandedRows.update(s => new Set(s).add(idx));
  }

  removeRow(index: number) {
    this.formArray.removeAt(index);
    this.expandedRows.update(s => {
      const next = new Set<number>();
      s.forEach(i => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  }

  moveRow(index: number, direction: number) {
    const target = index + direction;
    if (target < 0 || target >= this.formArray.length) return;
    const ctrl = this.formArray.at(index);
    this.formArray.removeAt(index);
    this.formArray.insert(target, ctrl);

    this.expandedRows.update(s => {
      const wasExpanded = s.has(index);
      const next = new Set(s);
      next.delete(index);
      if (wasExpanded) next.add(target);
      return next;
    });
  }

  // ── Expand / collapse ────────────────────────────────────────────────────

  toggleRow(index: number) {
    this.expandedRows.update(s => {
      const next = new Set(s);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  isExpanded(index: number): boolean {
    return this.expandedRows().has(index);
  }

  // ── Template helpers ─────────────────────────────────────────────────────

  asGroup(ctrl: AbstractControl): FormGroup {
    return ctrl as FormGroup;
  }

  /** Returns a short label for the row header — first text/email field value, or 'Empty'. */
  getRowPreview(index: number): string {
    const val = this.formArray.at(index)?.value ?? {};
    const firstTextField = this.rowFields.find(f =>
      f.type === 'text' || f.type === 'email' || f.type === 'number'
    );
    if (firstTextField) {
      const v = val[firstTextField.name];
      if (v !== undefined && v !== null && v !== '') {
        // Handle localized values in preview
        if (typeof v === 'object') {
          return this.localeService.translate(v);
        }
        return String(v);
      }
    }
    return 'Empty';
  }
}
