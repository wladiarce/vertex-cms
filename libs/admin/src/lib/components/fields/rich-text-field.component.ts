import { Component, Input, OnDestroy, Injector, runInInjectionContext, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormsModule } from '@angular/forms';
import { FieldOptions } from '@vertex/common';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TiptapEditorDirective } from 'ngx-tiptap';

@Component({
  selector: 'vertex-rich-text-field',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TiptapEditorDirective],
  providers: [TiptapEditorDirective],
  template: `
    <div [formGroup]="group" class="mb-6">
      <div class="v-input-group">
        <label>
          {{ field.label || field.name }}
          @if (field.required) {
            <span class="text-[var(--primary)]">*</span>
          }
        </label>
      </div>

      <div class="border border-[var(--border)] overflow-hidden bg-[var(--bg-surface)] shadow-[var(--shadow-depth)] transition-shadow hover:shadow-[var(--shadow-hover)]">
        <!-- Toolbar -->
        <div class="flex flex-wrap gap-1 p-2 bg-[var(--bg-subtle)] border-b border-[var(--border-dim)]" *ngIf="editor">
          
          <button type="button" (click)="toggleBold()" 
                  [class.bg-[var(--primary)]]="editor.isActive('bold')"
                  [class.text-white]="editor.isActive('bold')"
                  class="px-2 py-1 font-mono text-xs font-bold border border-[var(--border-dim)] hover:bg-[var(--bg-input)] transition-colors" 
                  title="Bold">
            B
          </button>
          
          <button type="button" (click)="toggleItalic()" 
                  [class.bg-[var(--primary)]]="editor.isActive('italic')"
                  [class.text-white]="editor.isActive('italic')"
                  class="px-2 py-1 font-mono text-xs italic border border-[var(--border-dim)] hover:bg-[var(--bg-input)] transition-colors" 
                  title="Italic">
            I
          </button>

          <div class="w-px h-6 bg-[var(--border-dim)] mx-1"></div>

          <button type="button" (click)="setHeading(2)" 
                  [class.bg-[var(--primary)]]="editor.isActive('heading', { level: 2 })"
                  [class.text-white]="editor.isActive('heading', { level: 2 })"
                  class="px-2 py-1 font-mono text-xs font-bold border border-[var(--border-dim)] hover:bg-[var(--bg-input)] transition-colors" 
                  title="H2">
            H2
          </button>
          
          <button type="button" (click)="setHeading(3)" 
                  [class.bg-[var(--primary)]]="editor.isActive('heading', { level: 3 })"
                  [class.text-white]="editor.isActive('heading', { level: 3 })"
                  class="px-2 py-1 font-mono text-xs font-bold border border-[var(--border-dim)] hover:bg-[var(--bg-input)] transition-colors" 
                  title="H3">
            H3
          </button>

          <div class="w-px h-6 bg-[var(--border-dim)] mx-1"></div>

          <button type="button" (click)="toggleBulletList()" 
                  [class.bg-[var(--primary)]]="editor.isActive('bulletList')"
                  [class.text-white]="editor.isActive('bulletList')"
                  class="px-2 py-1 font-mono text-xs border border-[var(--border-dim)] hover:bg-[var(--bg-input)] transition-colors" 
                  title="Bullet List">
            • List
          </button>
        </div>

        <!-- Editor -->
        <tiptap-editor [editor]="editor" 
                       [(ngModel)]="value" 
                       [ngModelOptions]="{standalone: true}"
                       class="prose prose-sm max-w-none min-h-[150px] outline-none bg-[var(--bg-input)]">
        </tiptap-editor>
      </div>
      
      <input type="hidden" [formControlName]="field.name">
    </div>
  `,
  styles: [`
    :host ::ng-deep .ProseMirror {
      outline: none;
      min-height: 150px;
      color: var(--text-main);
      margin: 1.5rem;
    }
    :host ::ng-deep .ProseMirror:focus {
      outline: none;
    }
  `]
})
export class RichTextFieldComponent implements OnInit, OnDestroy {
  @Input({ required: true }) field!: FieldOptions & { name: string };
  @Input({ required: true }) group!: FormGroup;

  editor: any;

  // We sync Tiptap's model with the Angular FormControl manually for better control
  get control() { return this.group.get(this.field.name); }
  
  // Local value accessor
  get value() { return this.control?.value || ''; }
  set value(val: string) { 
    this.control?.setValue(val);
    this.control?.markAsDirty();
  }

  ngOnInit() {
    this.editor = new Editor({
      extensions: [StarterKit],
      content: this.value, // Load initial content
      onUpdate: ({ editor }) => {
        // Sync HTML back to form control
        this.value = editor.getHTML();
      }
    });

    // Handle external form changes (e.g. data loaded from API)
    this.control?.valueChanges.subscribe(val => {
      if (val !== this.editor.getHTML()) {
        this.editor.commands.setContent(val);
      }
    });
  }

  ngOnDestroy() {
    this.editor.destroy();
  }

  // --- Toolbar Actions ---
  toggleBold() { this.editor.chain().focus().toggleBold().run(); }
  toggleItalic() { this.editor.chain().focus().toggleItalic().run(); }
  setHeading(level: 2 | 3) { this.editor.chain().focus().toggleHeading({ level }).run(); }
  toggleBulletList() { this.editor.chain().focus().toggleBulletList().run(); }
}