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
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ field.label || field.name }}
      </label>

      <div class="border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <div class="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200" *ngIf="editor">
          
          <button type="button" (click)="toggleBold()" [class.bg-gray-200]="editor.isActive('bold')" 
                  class="p-1 rounded hover:bg-gray-200" title="Bold">
            <strong>B</strong>
          </button>
          
          <button type="button" (click)="toggleItalic()" [class.bg-gray-200]="editor.isActive('italic')" 
                  class="p-1 rounded hover:bg-gray-200 italic" title="Italic">
            I
          </button>

          <div class="w-px h-6 bg-gray-300 mx-1"></div>

          <button type="button" (click)="setHeading(2)" [class.bg-gray-200]="editor.isActive('heading', { level: 2 })" 
                  class="p-1 rounded hover:bg-gray-200 font-bold" title="H2">
            H2
          </button>
          
          <button type="button" (click)="setHeading(3)" [class.bg-gray-200]="editor.isActive('heading', { level: 3 })" 
                  class="p-1 rounded hover:bg-gray-200 font-bold text-sm" title="H3">
            H3
          </button>

          <div class="w-px h-6 bg-gray-300 mx-1"></div>

          <button type="button" (click)="toggleBulletList()" [class.bg-gray-200]="editor.isActive('bulletList')" 
                  class="p-1 rounded hover:bg-gray-200" title="Bullet List">
            • List
          </button>
        </div>

        <tiptap-editor [editor]="editor" 
                       [(ngModel)]="value" 
                       [ngModelOptions]="{standalone: true}"
                       class="prose prose-sm max-w-none p-4 min-h-[150px] outline-none">
        </tiptap-editor>
      </div>
      
      <input type="hidden" [formControlName]="field.name">
    </div>
  `,
  styles: [`
    :host ::ng-deep .ProseMirror {
      outline: none;
      min-height: 150px;
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