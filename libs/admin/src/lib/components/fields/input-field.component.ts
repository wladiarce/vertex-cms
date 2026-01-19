import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FieldOptions } from '@vertex/common';

@Component({
  selector: 'vertex-input-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="group" class="mb-4">
      <label [for]="field.name" class="block text-sm font-medium text-gray-700 mb-1">
        {{ field.label || field.name }}
        <span *ngIf="field.required" class="text-red-500">*</span>
      </label>
      
      <input
        [id]="field.name"
        [type]="inputType"
        [formControlName]="field.name"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        [class.border-red-500]="isInvalid"
      />
      
      @if (isInvalid) {
        <p class="mt-1 text-sm text-red-500">
          This field is required
        </p>
      }
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