import { Component, Input, OnDestroy, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormsModule } from '@angular/forms';
import { FieldOptions } from '@vertex-cms/common';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TiptapEditorDirective } from 'ngx-tiptap';

// StarterKit v3 includes: Bold, Italic, Underline, Strike, Code, CodeBlock,
// Heading (all levels), BulletList, OrderedList, ListItem, ListKeymap,
// Blockquote, HorizontalRule, HardBreak, Link, Dropcursor, Gapcursor, History

interface ToolGroup {
  tools: Tool[];
}
interface Tool {
  label: string;
  title: string;
  action: () => void;
  isActive: () => boolean;
}

@Component({
  selector: 'vertex-rich-text-field',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TiptapEditorDirective],
  template: `
    <div [formGroup]="group" class="mb-6">
      <!-- Label -->
      <div class="v-input-group">
        <label>
          {{ field.label || field.name }}
          @if (field.required) {
            <span class="rte-required">*</span>
          }
        </label>
      </div>

      <!-- Editor shell -->
      <div class="rte-shell" [class.rte-shell--focused]="focused">

        <!-- ── Toolbar ──────────────────────────────────────────────── -->
        @if (editor) {
          <div class="rte-toolbar">

            <!-- Block type selector -->
            <select class="rte-block-select" (change)="onBlockSelect($event)" title="Paragraph style">
              <option value="paragraph"         [selected]="isBlock('paragraph')">Paragraph</option>
              <option value="heading-1"         [selected]="isBlock('heading', 1)">Heading 1</option>
              <option value="heading-2"         [selected]="isBlock('heading', 2)">Heading 2</option>
              <option value="heading-3"         [selected]="isBlock('heading', 3)">Heading 3</option>
              <option value="heading-4"         [selected]="isBlock('heading', 4)">Heading 4</option>
              <option value="code-block"        [selected]="isBlock('codeBlock')">Code Block</option>
              <option value="blockquote"        [selected]="isBlock('blockquote')">Blockquote</option>
            </select>

            <div class="rte-sep"></div>

            <!-- Inline marks -->
            <button type="button" class="rte-btn" [class.rte-btn--active]="editor.isActive('bold')"
              title="Bold (Ctrl+B)" (click)="cmd.toggleBold()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 11.8c.9-.7 1.4-1.7 1.4-2.8 0-2.2-1.8-4-4-4H6v14h7c2.2 0 4-1.8 4-4 0-1.3-.6-2.5-1.4-3.2zM9 7h3c.8 0 1.5.7 1.5 1.5S12.8 10 12 10H9V7zm3.5 8H9v-3h3.5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5z"/></svg>
            </button>

            <button type="button" class="rte-btn" [class.rte-btn--active]="editor.isActive('italic')"
              title="Italic (Ctrl+I)" (click)="cmd.toggleItalic()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>
            </button>

            <button type="button" class="rte-btn" [class.rte-btn--active]="editor.isActive('underline')"
              title="Underline (Ctrl+U)" (click)="cmd.toggleUnderline()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>
            </button>

            <button type="button" class="rte-btn" [class.rte-btn--active]="editor.isActive('strike')"
              title="Strikethrough" (click)="cmd.toggleStrike()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.85 7.08C6.85 4.37 9.45 3 12.24 3c1.64 0 3 .49 3.9 1.28.77.65 1.46 1.73 1.46 3.24h-3.01c0-.31-.05-.59-.15-.85-.29-.86-1.2-1.28-2.25-1.28-1.86 0-2.34 1.02-2.34 1.7 0 .48.25.88.74 1.21L6.85 7.08zM21 12v-2H3v2h9.62c1.15.43 2.1 1.04 2.1 2.08 0 1.05-.87 1.96-2.5 1.96-1.52 0-2.62-.67-2.98-1.96H6.23c.4 2.44 2.64 4 5.87 4 3.31 0 5.53-1.85 5.53-4.3 0-.3-.04-.59-.13-.87L21 12z"/></svg>
            </button>

            <button type="button" class="rte-btn" [class.rte-btn--active]="editor.isActive('code')"
              title="Inline code" (click)="cmd.toggleCode()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </button>

            <div class="rte-sep"></div>

            <!-- Lists -->
            <button type="button" class="rte-btn" [class.rte-btn--active]="editor.isActive('bulletList')"
              title="Bullet list" (click)="cmd.toggleBulletList()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
            </button>

            <button type="button" class="rte-btn" [class.rte-btn--active]="editor.isActive('orderedList')"
              title="Ordered list" (click)="cmd.toggleOrderedList()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-8v2h14V3H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
            </button>

            <div class="rte-sep"></div>

            <!-- Link -->
            <button type="button" class="rte-btn" [class.rte-btn--active]="editor.isActive('link')"
              title="Insert/edit link" (click)="toggleLink()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            </button>

            <button type="button" class="rte-btn" title="Remove link"
              [disabled]="!editor.isActive('link')"
              (click)="cmd.unsetLink()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 00-.12-7.07 5.006 5.006 0 00-6.95 0l-1.72 1.71"/><path d="M5.17 11.75l-1.71 1.71a5.004 5.004 0 00.12 7.07 5.006 5.006 0 006.95 0l1.71-1.71"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="2" y1="8" x2="5" y2="8"/><line x1="16" y1="19" x2="16" y2="22"/><line x1="19" y1="16" x2="22" y2="16"/></svg>
            </button>

            <div class="rte-sep"></div>

            <!-- HR -->
            <button type="button" class="rte-btn" title="Horizontal rule" (click)="cmd.insertHorizontalRule()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>
            </button>

            <!-- Clear formatting -->
            <button type="button" class="rte-btn" title="Clear formatting" (click)="cmd.clearFormatting()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L3 14.67V21h6.33l10.06-10.06a5.5 5.5 0 000-7.78z"/><line x1="18" y1="11.5" x2="12" y2="5.5"/><line x1="2" y1="22" x2="22" y2="2"/></svg>
            </button>

            <div class="rte-sep"></div>

            <!-- Undo / Redo -->
            <button type="button" class="rte-btn" title="Undo (Ctrl+Z)"
              [disabled]="!editor.can().undo()"
              (click)="cmd.undo()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>
            </button>

            <button type="button" class="rte-btn" title="Redo (Ctrl+Shift+Z)"
              [disabled]="!editor.can().redo()"
              (click)="cmd.redo()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 014-4h12"/></svg>
            </button>

            <!-- Character count -->
            <span class="rte-char-count">{{ charCount }} chars</span>
          </div>
        }

        <!-- ── Link input bar ───────────────────────────────────────── -->
        @if (showLinkInput) {
          <div class="rte-link-bar">
            <span class="rte-link-label font-mono">URL:</span>
            <input
              #linkInput
              type="url"
              class="rte-link-input"
              placeholder="https://..."
              [(ngModel)]="linkUrl"
              [ngModelOptions]="{standalone: true}"
              (keydown.enter)="applyLink()"
              (keydown.escape)="showLinkInput = false"
            />
            <button type="button" class="rte-link-apply" (click)="applyLink()">Apply</button>
            <button type="button" class="rte-link-cancel" (click)="showLinkInput = false">✕</button>
          </div>
        }

        <!-- ── Tiptap editor ────────────────────────────────────────── -->
        <tiptap-editor
          [editor]="editor"
          [(ngModel)]="value"
          [ngModelOptions]="{standalone: true}"
          class="rte-content"
          (focus)="focused = true"
          (blur)="focused = false"
        ></tiptap-editor>

        <!-- Hidden control -->
        <input type="hidden" [formControlName]="field.name">
      </div>
    </div>
  `,
  styles: [`
    /* ── Shell ─────────────────────────────────────────────────────────── */
    .rte-shell {
      border: 1px solid var(--border-dim);
      border-radius: var(--radius);
      background: var(--bg-surface);
      box-shadow: var(--shadow-depth);
      overflow: hidden;
      transition: box-shadow 0.2s, border-color 0.2s;
    }
    .rte-shell--focused {
      border-color: var(--primary);
      box-shadow: 2px 2px 0 rgba(255,79,0,0.15);
    }
    .rte-required { color: var(--primary); margin-left: 2px; }

    /* ── Toolbar ────────────────────────────────────────────────────────── */
    .rte-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 2px;
      padding: 6px 8px;
      background: var(--bg-subtle);
      border-bottom: 1px solid var(--border-dim);
    }

    .rte-block-select {
      height: 28px;
      padding: 0 0.5rem;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      background: var(--bg-input);
      border: 1px solid var(--border-dim);
      border-radius: 2px;
      color: var(--text-main);
      outline: none;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      min-width: 110px;

      &:focus { border-color: var(--primary); }
    }

    .rte-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border: 1px solid transparent;
      border-radius: 2px;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.12s;
      flex-shrink: 0;

      &:hover:not(:disabled) {
        background: var(--bg-input);
        color: var(--text-main);
        border-color: var(--border-dim);
      }

      &--active {
        background: var(--primary) !important;
        color: #fff !important;
        border-color: var(--primary) !important;
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    .rte-sep {
      width: 1px;
      height: 20px;
      background: var(--border-dim);
      margin: 0 4px;
      flex-shrink: 0;
    }

    .rte-char-count {
      margin-left: auto;
      font-family: var(--font-mono);
      font-size: 0.65rem;
      color: var(--text-muted);
      white-space: nowrap;
    }

    /* ── Link bar ───────────────────────────────────────────────────────── */
    .rte-link-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: var(--bg-subtle);
      border-bottom: 1px solid var(--border-dim);
    }
    .rte-link-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      flex-shrink: 0;
    }
    .rte-link-input {
      flex: 1;
      height: 26px;
      padding: 0 0.5rem;
      font-size: 0.85rem;
      background: var(--bg-input);
      border: 1px solid var(--border-dim);
      border-radius: 2px;
      color: var(--text-main);
      outline: none;
      &:focus { border-color: var(--primary); }
    }
    .rte-link-apply {
      height: 26px;
      padding: 0 0.75rem;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 2px;
      cursor: pointer;
    }
    .rte-link-cancel {
      height: 26px;
      width: 26px;
      background: none;
      border: 1px solid var(--border-dim);
      border-radius: 2px;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.8rem;
      &:hover { color: var(--primary); }
    }

    /* ── ProseMirror content area ───────────────────────────────────────── */
    .rte-content {
      display: block;
    }

    :host ::ng-deep .ProseMirror {
      outline: none;
      min-height: 200px;
      padding: 1rem 1.25rem;
      font-family: var(--font-ui);
      font-size: 0.95rem;
      line-height: 1.75;
      color: var(--text-main);
      background: var(--bg-input);

      /* Placeholder */
      p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        color: var(--text-muted);
        pointer-events: none;
        float: left;
        height: 0;
      }

      /* Headings */
      h1 { font-size: 1.7rem; font-weight: 700; letter-spacing: -0.02em; margin: 1.2em 0 0.4em; line-height: 1.2; }
      h2 { font-size: 1.35rem; font-weight: 700; margin: 1.2em 0 0.4em; padding-bottom: 0.3rem; border-bottom: 2px solid var(--border-dim); }
      h3 { font-size: 1.1rem; font-weight: 700; margin: 1em 0 0.35em; }
      h4 { font-size: 0.95rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 1em 0 0.35em; font-family: var(--font-mono); color: var(--text-muted); }
      h1:first-child, h2:first-child, h3:first-child { margin-top: 0; }

      /* Paragraph */
      p { margin: 0 0 0.75em; }
      p:last-child { margin-bottom: 0; }

      /* Inline marks */
      strong { font-weight: 700; }
      em { font-style: italic; }
      u { text-decoration: underline; }
      s { text-decoration: line-through; color: var(--text-muted); }

      /* Inline code */
      code {
        font-family: var(--font-mono);
        font-size: 0.875em;
        background: var(--bg-subtle);
        border: 1px solid var(--border-dim);
        padding: 0.1em 0.35em;
        border-radius: 2px;
        color: var(--primary);
      }

      /* Code block */
      pre {
        background: #1a1a1a;
        color: #e0e0e0;
        padding: 1rem 1.25rem;
        border-radius: var(--radius);
        overflow-x: auto;
        font-family: var(--font-mono);
        font-size: 0.85rem;
        line-height: 1.65;
        margin: 1rem 0;
        border: 1px solid var(--border);
        box-shadow: 3px 3px 0 var(--border);

        code {
          background: transparent;
          border: none;
          color: inherit;
          padding: 0;
          font-size: inherit;
        }
      }

      /* Lists — proper li structure */
      ul {
        list-style: none;
        padding-left: 0;
        margin: 0.5em 0 0.75em;

        li {
          display: flex;
          align-items: flex-start;
          gap: 0.6em;
          margin-bottom: 0.3em;
          padding-left: 0;

          &::before {
            content: '→';
            color: var(--primary);
            font-family: var(--font-mono);
            font-size: 0.8em;
            flex-shrink: 0;
            margin-top: 0.2em;
          }

          p { margin: 0; }
        }
      }

      ol {
        list-style: decimal;
        padding-left: 1.5rem;
        margin: 0.5em 0 0.75em;

        li {
          margin-bottom: 0.3em;
          p { margin: 0; }

          &::marker { color: var(--primary); font-family: var(--font-mono); font-weight: 700; font-size: 0.85em; }
        }
      }

      /* Blockquote */
      blockquote {
        border-left: 3px solid var(--primary);
        padding: 0.5rem 1rem;
        margin: 1rem 0;
        background: color-mix(in srgb, var(--primary) 5%, var(--bg-surface));
        color: var(--text-muted);
        font-style: italic;
        border-radius: 0 2px 2px 0;

        p { margin: 0; }
      }

      /* Link */
      a {
        color: var(--primary);
        text-decoration: underline;
        text-underline-offset: 3px;
        cursor: pointer;
      }

      /* HR */
      hr {
        border: none;
        border-top: 2px solid var(--border-dim);
        margin: 1.5rem 0;
      }

      /* Text alignment — requires @tiptap/extension-text-align (not yet installed) */

      /* Selection */
      ::selection {
        background: color-mix(in srgb, var(--primary) 20%, transparent);
      }

      /* Cursor gap */
      .ProseMirror-gapcursor { display: none; }
      .ProseMirror-focused .ProseMirror-gapcursor { display: block; }
    }

    :host ::ng-deep .ProseMirror-focused { outline: none; }
  `]
})
export class RichTextFieldComponent implements OnInit, OnDestroy {
  @Input({ required: true }) field!: FieldOptions & { name: string };
  @Input({ required: true }) group!: FormGroup;

  private cdr = inject(ChangeDetectorRef);

  editor!: Editor;
  focused = false;
  showLinkInput = false;
  linkUrl = '';
  charCount = 0;

  get control() { return this.group.get(this.field.name); }

  get value() { return this.control?.value || ''; }
  set value(val: string) {
    this.control?.setValue(val);
    this.control?.markAsDirty();
    this.charCount = this.editor?.getText().length ?? 0;
  }

  // ── Block-type select dropdown ─────────────────────────────────────────

  isBlock(type: string, level?: number): boolean {
    if (!this.editor) return false;
    if (type === 'paragraph') return this.editor.isActive('paragraph');
    if (type === 'heading')   return this.editor.isActive('heading', { level });
    if (type === 'codeBlock') return this.editor.isActive('codeBlock');
    if (type === 'blockquote')return this.editor.isActive('blockquote');
    return false;
  }

  onBlockSelect(event: Event) {
    const v = (event.target as HTMLSelectElement).value;
    const c = this.editor.chain().focus();
    switch (v) {
      case 'paragraph':  c.setParagraph().run(); break;
      case 'heading-1':  c.setHeading({ level: 1 }).run(); break;
      case 'heading-2':  c.setHeading({ level: 2 }).run(); break;
      case 'heading-3':  c.setHeading({ level: 3 }).run(); break;
      case 'heading-4':  c.setHeading({ level: 4 }).run(); break;
      case 'code-block': c.setCodeBlock().run(); break;
      case 'blockquote': c.setBlockquote().run(); break;
    }
  }

  // ── Link handling ──────────────────────────────────────────────────────

  toggleLink() {
    if (this.editor.isActive('link')) {
      this.editor.chain().focus().unsetLink().run();
    } else {
      // Pre-fill if there's already a URL
      const attrs = this.editor.getAttributes('link');
      this.linkUrl = attrs['href'] ?? '';
      this.showLinkInput = true;
    }
  }

  applyLink() {
    if (!this.linkUrl.trim()) return;
    this.editor.chain().focus()
      .setLink({ href: this.linkUrl.trim(), target: '_blank' })
      .run();
    this.showLinkInput = false;
    this.linkUrl = '';
  }

  // ── Command facade (keeps template readable) ───────────────────────────

  get cmd() {
    const e = this.editor;
    return {
      toggleBold:         () => e.chain().focus().toggleBold().run(),
      toggleItalic:       () => e.chain().focus().toggleItalic().run(),
      toggleUnderline:    () => e.chain().focus().toggleUnderline().run(),
      toggleStrike:       () => e.chain().focus().toggleStrike().run(),
      toggleCode:         () => e.chain().focus().toggleCode().run(),
      toggleBulletList:   () => e.chain().focus().toggleBulletList().run(),
      toggleOrderedList:  () => e.chain().focus().toggleOrderedList().run(),
      setTextAlignLeft:   () => {},  // requires @tiptap/extension-text-align
      setTextAlignCenter: () => {},
      setTextAlignRight:  () => {},
      insertHorizontalRule: () => e.chain().focus().setHorizontalRule().run(),
      clearFormatting:    () => e.chain().focus().clearNodes().unsetAllMarks().run(),
      unsetLink:          () => e.chain().focus().unsetLink().run(),
      undo:               () => e.chain().focus().undo().run(),
      redo:               () => e.chain().focus().redo().run(),
    };
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  ngOnInit() {
    this.editor = new Editor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3, 4] },
          // link and underline are included in StarterKit v3's dependencies
          // and are auto-configured; no need to override unless disabling
          link: {
            openOnClick: false,
            HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
          },
        }),
      ],
      content: this.value,
      editorProps: {
        attributes: {
          spellcheck: 'true',
          'data-placeholder': 'Start writing…',
        },
      },
      onUpdate: ({ editor }) => {
        this.value = editor.getHTML();
        this.cdr.markForCheck();
      },
      onSelectionUpdate: () => {
        this.cdr.markForCheck(); // Re-evaluate isActive() bindings
      },
    });

    this.charCount = this.editor.getText().length;

    // Sync external form changes (e.g. patchValue from API load)
    this.control?.valueChanges.subscribe(val => {
      if (val !== this.editor.getHTML()) {
        // this.editor.commands.setContent(val ?? '', false);
        this.editor.commands.setContent(val ?? '');
        this.charCount = this.editor.getText().length;
      }
    });
  }

  ngOnDestroy() {
    this.editor?.destroy();
  }
}