import { booleanAttribute, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vertex-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="buttonClasses()"
    >
      @if (icon()) {
        <i [attr.data-lucide]="icon()"></i>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class VertexButtonComponent {
  variant = input<'default' | 'primary' | 'danger'>('default');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  icon = input<string>('');
  type = input<'button' | 'submit' | 'reset'>('button');
  fluid = input(false, {transform: booleanAttribute});

  buttonClasses() {
    const classes = ['v-btn'];
    
    if (this.variant() === 'primary') {
      classes.push('primary');
    } else if (this.variant() === 'danger') {
      classes.push('danger');
    }
    
    if (this.size() === 'sm') {
      classes.push('sm');
    } else if (this.size() === 'lg') {
      classes.push('lg');
    }

    if (this.fluid()) {
      classes.push('w-full');
    }
    
    return classes.join(' ');
  }
}
