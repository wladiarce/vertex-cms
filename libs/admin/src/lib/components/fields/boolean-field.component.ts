import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FieldOptions } from '@vertex-cms/common';

@Component({
  selector: 'vertex-boolean-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="group" class="mb-6">
      <div class="v-input-group flex flex-row items-center justify-between p-3 border border-[var(--border-dim)] rounded bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer" (click)="toggle()">
        <div class="flex flex-col gap-0.5 pointer-events-none">
          <label [for]="field.name" class="cursor-pointer !mb-0">
            {{ field.label || field.name }}
          </label>
          @if (field.description) {
            <p class="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">{{ field.description }}</p>
          }
        </div>
        
        <div class="vertex-toggle">
          <input
            [id]="field.name"
            type="checkbox"
            [formControlName]="field.name"
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-[var(--border-dim)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)] position-relative"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vertex-toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }
    .position-relative {
      position: relative;
    }
  `]
})
export class BooleanFieldComponent {
  @Input({ required: true }) field!: FieldOptions & { name: string; description?: string };
  @Input({ required: true }) group!: FormGroup;

  toggle() {
    const control = this.group.get(this.field.name);
    if (control) {
      control.setValue(!control.value);
      control.markAsDirty();
      control.markAsTouched();
    }
  }
}
