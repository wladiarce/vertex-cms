import { Component, Input, OnInit, signal, Type, inject } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BlockMetadata, FieldOptions, FieldType } from '@vertex-cms/common';
import { VertexClientService } from '../../services/vertex-client.service';
import { InputFieldComponent } from '../fields/input-field.component';
import { UploadFieldComponent } from '../fields/upload-field.component';
import { RichTextFieldComponent } from '../fields/rich-text-field.component';
import { LocalizedFieldComponent } from '../fields/localized-field.component';
import { RelationshipFieldComponent } from '../fields/relationship-field.component';

@Component({
  selector: 'vertex-field-renderer',
  standalone: true,
  imports: [
    CommonModule,
    NgComponentOutlet,
    ReactiveFormsModule,
    InputFieldComponent,
    UploadFieldComponent,
    RichTextFieldComponent,
    LocalizedFieldComponent,
    RelationshipFieldComponent
  ],
  template: `
    @switch (field.type) {
      @case ('text') {
        @if (field.localized) {
          <vertex-localized-field [field]="field" [group]="group" />
        } @else {
          <vertex-input-field [field]="field" [group]="group" />
        }
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
        @if (cms.capabilities().storage) {
          <vertex-upload-field [field]="field" [group]="group" />
        } @else {
          <div class="v-card border-dashed p-4 flex items-center gap-3 text-[var(--text-muted)] bg-[var(--bg-subtle)]">
            <i data-lucide="alert-circle" class="w-5 h-5"></i>
            <div>
              <p class="text-sm font-medium">Upload feature is disabled</p>
              <p class="text-xs">No storage plugin is registered. Please contact your administrator.</p>
            </div>
          </div>
        }
      }
      @case ('rich-text') {
        @if (field.localized) {
          <vertex-localized-field [field]="field" [group]="group" />
        } @else {
          <vertex-rich-text-field [field]="field" [group]="group" />
        }
      }
      @case ('relationship') {
        <vertex-relationship-field [field]="field" [group]="group" />
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
  cms = inject(VertexClientService);
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
