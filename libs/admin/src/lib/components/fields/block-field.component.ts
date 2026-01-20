import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FieldOptions, BlockMetadata } from '@vertex/common';
import { FieldRendererComponent } from '../form/field-renderer.component'; // Recursive import!

@Component({
  selector: 'vertex-blocks-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FieldRendererComponent],
  template: `
    <div class="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <label class="block text-sm font-bold text-gray-700 mb-4">
        {{ field.label || field.name }}
      </label>

      <div [formGroup]="parentForm">
        <div [formArrayName]="field.name" class="space-y-4">
          
          @for (control of formArray.controls; track control; let i = $index) {
            <div [formGroupName]="i" class="bg-white border border-gray-300 rounded shadow-sm">
              <div class="flex justify-between items-center px-4 py-2 bg-gray-100 border-b cursor-move">
                <span class="font-semibold text-sm uppercase text-gray-600">
                  {{ getBlockLabel(i) }}
                </span>
                <div class="flex gap-2 text-xs">
                  <button type="button" (click)="moveBlock(i, -1)" [disabled]="i === 0" class="hover:text-blue-600 disabled:opacity-30">▲</button>
                  <button type="button" (click)="moveBlock(i, 1)" [disabled]="i === formArray.length - 1" class="hover:text-blue-600 disabled:opacity-30">▼</button>
                  <button type="button" (click)="removeBlock(i)" class="text-red-500 hover:text-red-700">Remove</button>
                </div>
              </div>

              <div class="p-4 space-y-4">
                <input type="hidden" formControlName="blockType">
                
                @for (subField of getBlockFields(i); track subField.name) {
                  <vertex-field-renderer [field]="subField" [group]="getAsGroup(control)" />
                }
              </div>
            </div>
          }

        </div>
      </div>

      <div class="mt-4">
        <p class="text-xs text-gray-500 mb-2 font-medium">Add Block:</p>
        <div class="flex flex-wrap gap-2">
          @for (block of availableBlocks; track block.slug) {
            <button type="button" 
                    (click)="addBlock(block)"
                    class="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 hover:border-blue-400 transition-colors">
              + {{ block.label }}
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class BlocksFieldComponent implements OnInit {
  @Input({ required: true }) field!: FieldOptions & { name: string; blocks?: BlockMetadata[] };
  @Input({ required: true }) group!: FormGroup;

  private fb = inject(FormBuilder);

  // Helper getter for the FormArray
  get formArray(): FormArray {
    return this.group.get(this.field.name) as FormArray;
  }

  // Helper alias for the template because [formGroup] expects FormGroup, not AbstractControl
  get parentForm(): FormGroup {
    return this.group;
  }
  
  // Get available block definitions from metadata
  get availableBlocks(): BlockMetadata[] {
    return this.field.blocks || [];
  }

  ngOnInit() {
    // 1. Initialize FormArray if it doesn't exist
    if (!this.group.get(this.field.name)) {
      this.group.addControl(this.field.name, this.fb.array([]));
    }

    // 2. Handle Edit Mode: If data exists, we must rebuild the FormArray structure
    const existingData = this.group.get(this.field.name)?.value;
    if (Array.isArray(existingData) && existingData.length > 0 && this.formArray.length === 0) {
      existingData.forEach((item: any) => {
        const blockMeta = this.availableBlocks.find(b => b.slug === item.blockType);
        if (blockMeta) {
          this.formArray.push(this.createBlockGroup(blockMeta, item));
        }
      });
    }
  }

  /**
   * Creates a FormGroup for a specific block type
   */
  createBlockGroup(blockMeta: BlockMetadata, data: any = {}): FormGroup {
    const group: any = {
      blockType: [blockMeta.slug] // Always store the type!
    };

    blockMeta.fields.forEach(f => {
      const validators = f.required ? [Validators.required] : [];
      group[f.name] = [data[f.name] || '', validators];
    });

    return this.fb.group(group);
  }

  addBlock(blockMeta: BlockMetadata) {
    this.formArray.push(this.createBlockGroup(blockMeta));
  }

  removeBlock(index: number) {
    this.formArray.removeAt(index);
  }

  moveBlock(index: number, direction: number) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < this.formArray.length) {
      const control = this.formArray.at(index);
      this.formArray.removeAt(index);
      this.formArray.insert(newIndex, control);
    }
  }

  // Helpers for Template
  getAsGroup(control: any): FormGroup {
    return control as FormGroup;
  }

  getBlockLabel(index: number): string {
    const type = this.formArray.at(index).value.blockType;
    const meta = this.availableBlocks.find(b => b.slug === type);
    return meta?.label || type;
  }

  getBlockFields(index: number): any[] {
    const type = this.formArray.at(index).value.blockType;
    const meta = this.availableBlocks.find(b => b.slug === type);
    return meta?.fields || [];
  }
}