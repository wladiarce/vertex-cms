import { Component, input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'vertex-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VertexInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="v-input-group">
      @if (label()) {
        <label [for]="inputId">{{ label() }}</label>
      }
      @if (type() === 'textarea') {
        <textarea
          [id]="inputId"
          class="v-input"
          [class.font-mono]="monospace()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [rows]="rows()"
          [value]="value"
          (input)="onInputChange($event)"
          (blur)="onTouched()"
        ></textarea>
      } @else {
        <input
          [id]="inputId"
          [type]="type()"
          class="v-input"
          [class.font-mono]="monospace()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [value]="value"
          (input)="onInputChange($event)"
          (blur)="onTouched()"
        />
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class VertexInputComponent implements ControlValueAccessor {
  label = input<string>('');
  type = input<'text' | 'email' | 'password' | 'number' | 'textarea'>('text');
  placeholder = input<string>('');
  monospace = input<boolean>(false);
  disabled = input<boolean>(false);
  rows = input<number>(3);

  value: string = '';
  onChange: any = () => {};
  onTouched: any = () => {};

  // Generate unique ID for input/label association
  inputId = `vertex-input-${Math.random().toString(36).substr(2, 9)}`;

  onInputChange(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
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
