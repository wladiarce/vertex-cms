import { Component, input, OnInit, inject, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

// Declare lucide globally
declare const lucide: any;

@Component({
  selector: 'vertex-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="v-card">
      @if (title()) {
        <div class="v-card-header">
          @if (icon()) {
            <i-lucide [img]="icon()" class="w-4 h-4"></i-lucide>
          }
          <span>{{ title() }}</span>
        </div>
      }
      <div [class.v-card-body]="padding()">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class VertexCardComponent {

  title = input<string>('');
  icon = input<LucideIconData | undefined>();
  padding = input<boolean>(true);

}
