import { Component, Input, OnInit, signal, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BlockMetadata, FieldOptions, FieldType } from '@vertex/common';
import { InputFieldComponent } from '../fields/input-field.component';
import { UploadFieldComponent } from '../fields/upload-field.component';
import { RichTextFieldComponent } from '../fields/rich-text-field.component';

@Component({
  selector: 'vertex-field-renderer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent, UploadFieldComponent, RichTextFieldComponent],
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
      @case ('blocks') {
        @if (blocksComponent(); as Comp) {
          <ng-container *ngComponentOutlet="Comp; inputs: { field: field, group: group }" />
        }
      }
      @case ('upload') {
        <vertex-upload-field [field]="field" [group]="group" />
      }
      @case ('rich-text') {
        <vertex-rich-text-field [field]="field" [group]="group" />
      }
      @default {
        <div class="p-4 bg-yellow-50 text-yellow-700 text-sm rounded">
          Field type <strong>{{ field.type }}</strong> not supported yet.
        </div>
      }
    }
  `
})
export class FieldRendererComponent implements OnInit {
  @Input({ required: true }) field!: FieldOptions & { name: string; blocks?: BlockMetadata[] | undefined; };
  @Input({ required: true }) group!: FormGroup;

  blocksComponent = signal<Type<any> | null>(null);

  ngOnInit() {
    // Dynamically import the component only when this class is instantiated
    if (this.field?.type === 'blocks' || true) { // simple check to trigger load
       import('../fields/block-field.component').then(m => {
        this.blocksComponent.set(m.BlocksFieldComponent);       
      })
      .catch(err => {
        console.error('Failed to load blocks component:', err);
      });
    }
  }
}