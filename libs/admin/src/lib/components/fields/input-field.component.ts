import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FieldOptions } from '@vertex/common';

@Component({
  selector: 'vertex-input-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="group" class="mb-6">
      <div class="v-input-group">
        <label [for]="field.name">
          {{ field.label || field.name }}
          @if (field.required) {
            <span class="text-[var(--primary)]">*</span>
          }
        </label>
        
        <input
          [id]="field.name"
          [type]="inputType"
          [formControlName]="field.name"
          class="v-input"
          [class.border-[var(--primary)]]="isInvalid"
        />
        
        @if (isInvalid) {
          <p class="mt-2 font-mono text-xs text-[var(--primary)] flex items-center gap-1">
            <i data-lucide="alert-circle" class="w-3 h-3"></i>
            This field is required
          </p>
        }
      </div>
    </div>
  `
})
export class InputFieldComponent {
  @Input({ required: true }) field!: FieldOptions & { name: string };
  @Input({ required: true }) group!: FormGroup;

  get inputType(): string {
    return this.field.type === 'number' ? 'number' : 'text';
  }

  get isInvalid(): boolean {
    const control = this.group.get(this.field.name);
    return !!(control && control.invalid && control.touched);
  }
}