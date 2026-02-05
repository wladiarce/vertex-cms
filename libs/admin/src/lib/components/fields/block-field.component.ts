import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FieldOptions, BlockMetadata } from '@vertex/common';
import { FieldRendererComponent } from '../form/field-renderer.component'; // Recursive import!

@Component({
  selector: 'vertex-blocks-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FieldRendererComponent],
  template: `
    <div class="mb-6">
      <div class="v-input-group mb-4">
        <label>
          {{ field.label || field.name }}
          @if (field.required) {
            <span class="text-[var(--primary)]">*</span>
          }
        </label>
      </div>

      <div [formGroup]="parentForm">
        <div [formArrayName]="field.name" class="space-y-4">
          
          @for (control of formArray.controls; track control; let i = $index) {
            <div [formGroupName]="i" class="v-block" [class.active]="selectedBlock() === i">
              <!-- Block Header -->
              <div class="v-block-header" (click)="toggleBlock(i)">
                <div class="flex items-center gap-3">
                  <i data-lucide="grip-vertical" class="w-4 h-4 text-[var(--text-muted)]"></i>
                  <span class="font-bold text-sm uppercase">{{ getBlockLabel(i) }}</span>
                  <span class="font-mono text-[10px] text-[var(--text-muted)] bg-[var(--border-dim)] px-1.5 py-0.5 rounded-sm">
                    #{{ i }}
                  </span>
                </div>
                <div class="flex items-center gap-3">
                  <button type="button" (click)="moveBlock(i, -1); $event.stopPropagation()" 
                          [disabled]="i === 0" 
                          class="font-mono text-xs hover:text-[var(--primary)] disabled:opacity-30 transition-colors"
                          title="Move up">
                    ▲
                  </button>
                  <button type="button" (click)="moveBlock(i, 1); $event.stopPropagation()" 
                          [disabled]="i === formArray.length - 1" 
                          class="font-mono text-xs hover:text-[var(--primary)] disabled:opacity-30 transition-colors"
                          title="Move down">
                    ▼
                  </button>
                  <button type="button" (click)="removeBlock(i); $event.stopPropagation()" 
                          class="font-mono text-xs text-[var(--primary)] hover:text-[var(--text-main)] transition-colors"
                          title="Remove">
                    Remove
                  </button>
                  <i [attr.data-lucide]="isBlockExpanded(i) ? 'chevron-up' : 'chevron-down'" 
                     class="w-4 h-4 text-[var(--text-muted)]"></i>
                </div>
              </div>

              <!-- Block Content (Collapsible) -->
              @if (isBlockExpanded(i)) {
                <div class="p-4 space-y-4 bg-[var(--bg-surface)]">
                  <input type="hidden" formControlName="blockType">
                  
                  @for (subField of getBlockFields(i); track subField.name) {
                    <vertex-field-renderer [field]="subField" [group]="getAsGroup(control)" />
                  }
                </div>
              }
            </div>
          }

        </div>
      </div>

      <!-- Add Block Buttons -->
      <div class="mt-4 p-4 border border-[var(--border-dim)] bg-[var(--bg-subtle)]">
        <p class="font-mono text-[10px] text-[var(--text-muted)] uppercase mb-3 font-semibold">Add Block:</p>
        <div class="flex flex-wrap gap-2">
          @for (block of availableBlocks; track block.slug) {
            <button type="button" 
                    (click)="addBlock(block)"
                    class="v-btn text-xs">
              <i data-lucide="plus" class="w-3 h-3"></i>
              {{ block.label }}
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

  // Track which block is selected/expanded
  selectedBlock = signal<number | null>(null);
  expandedBlocks = signal<Set<number>>(new Set());

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
      
      // Expand first block by default
      if (existingData.length > 0) {
        this.expandedBlocks.update(set => new Set(set).add(0));
      }
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
    const newIndex = this.formArray.length;
    this.formArray.push(this.createBlockGroup(blockMeta));
    // Auto-expand newly added block
    this.expandedBlocks.update(set => new Set(set).add(newIndex));
  }

  removeBlock(index: number) {
    this.formArray.removeAt(index);
    // Update expanded blocks indices
    this.expandedBlocks.update(set => {
      const newSet = new Set<number>();
      set.forEach(i => {
        if (i < index) newSet.add(i);
        else if (i > index) newSet.add(i - 1);
      });
      return newSet;
    });
  }

  moveBlock(index: number, direction: number) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < this.formArray.length) {
      const control = this.formArray.at(index);
      this.formArray.removeAt(index);
      this.formArray.insert(newIndex, control);
      
      // Update expanded state
      this.expandedBlocks.update(set => {
        const wasExpanded = set.has(index);
        const newSet = new Set(set);
        newSet.delete(index);
        if (wasExpanded) newSet.add(newIndex);
        return newSet;
      });
    }
  }

  toggleBlock(index: number) {
    this.expandedBlocks.update(set => {
      const newSet = new Set(set);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }

  isBlockExpanded(index: number): boolean {
    return this.expandedBlocks().has(index);
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