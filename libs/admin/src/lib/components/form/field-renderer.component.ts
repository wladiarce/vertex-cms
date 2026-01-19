import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldOptions, FieldType } from '@vertex/common';
import { InputFieldComponent } from '../fields/input-field.component';

@Component({
  selector: 'vertex-field-renderer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent],
  template: `
    @switch (field.type) {
      @case ('text') {
        <vertex-input-field [field]="field" [group]="group" />
      }
      @case ('number') {
        <vertex-input-field [field]="field" [group]="group" />
      }
      @case ('email') {
        <vertex-input-field [field]="field" [group]="group" />
      }
      @default {
        <div class="p-4 bg-yellow-50 text-yellow-700 text-sm rounded">
          Field type <strong>{{ field.type }}</strong> not supported yet.
        </div>
      }
    }
  `
})
export class FieldRendererComponent {
  @Input({ required: true }) field!: FieldOptions & { name: string };
  @Input({ required: true }) group!: FormGroup;
}