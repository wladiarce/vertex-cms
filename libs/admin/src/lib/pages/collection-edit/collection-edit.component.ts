import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VertexClientService } from '../../services/vertex-client.service';
import { FieldRendererComponent } from '../../components/form/field-renderer.component';
import { BlockMetadata } from '@vertex/common';
import { LocaleService } from '../../services/locale.service';

@Component({
  selector: 'vertex-collection-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FieldRendererComponent],
  template: `
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
      <header class="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 class="text-2xl font-bold">
            {{ isNew() ? 'Create' : 'Edit' }} {{ collection()?.singularName }}
          </h1>
          <p class="text-gray-500 text-sm mt-1">
            {{ isNew() ? 'Add a new entry' : 'ID: ' + id() }}
          </p>
          @if (!isNew() && draftsEnabled()) {
            <div class="flex gap-2 mt-2">
              @if (documentStatus() === 'draft') {
                <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">Draft</span>
              } @else if (documentStatus() === 'published') {
                <span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Published</span>
              } @else if (documentStatus() === 'archived') {
                <span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">Archived</span>
              }
            </div>
          }
        </div>
        <div class="flex gap-3">
          <a [routerLink]="['../']" class="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">
            Cancel
          </a>
          
          @if (draftsEnabled() && !isNew()) {
            <button type="button" (click)="toggleVersionHistory()" 
                    class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              📜 History
            </button>
          }
          @if (draftsEnabled()) {
            <button (click)="saveAsDraft()" [disabled]="form.invalid || loading()" 
                    class="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 disabled:opacity-50">
              {{ loading() && saveAction() === 'draft' ? 'Saving...' : 'Save as Draft' }}
            </button>
            <button (click)="publishDocument()" [disabled]="form.invalid || loading()" 
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {{ loading() && saveAction() === 'publish' ? 'Publishing...' : 'Publish' }}
            </button>
          } @else {
            <button (click)="save()" [disabled]="form.invalid || loading()" 
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {{ loading() ? 'Saving...' : 'Save' }}
            </button>
          }
        </div>
      </header>

      <form [formGroup]="form" class="space-y-6">
        @for (field of collection()?.fields; track field.name) {
          <vertex-field-renderer [field]="field" [group]="form" />
        }
      </form>
    </div>

    <!-- Version History Sidebar -->
    @if (showVersionHistory()) {
      <div class="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l z-50 flex flex-col">
        <!-- Header -->
        <div class="p-4 border-b flex justify-between items-center">
          <h2 class="text-lg font-semibold">Version History</h2>
          <button (click)="toggleVersionHistory()" class="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <!-- Version List -->
        <div class="flex-1 overflow-y-auto p-4">
          @if (loadingVersions()) {
            <div class="text-center py-8 text-gray-500">Loading versions...</div>
          } @else if (versions().length === 0) {
            <div class="text-center py-8 text-gray-500">
              No version history available.
            </div>
          } @else {
            @for (version of versions(); track version._id) {
              <div class="mb-4 p-4 border rounded hover:bg-gray-50">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <div class="font-semibold text-sm">Version {{ version.versionNumber }}</div>
                    <div class="text-xs text-gray-500">{{ version.createdAt | date:'medium' }}</div>
                    @if (version.createdBy) {
                      <div class="text-xs text-gray-500">By: {{ version.createdBy }}</div>
                    }
                  </div>
                  <button 
                    (click)="restoreVersion(version._id)"
                    class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    Restore
                  </button>
                </div>
              </div>
            }
          }
        </div>
      </div>

      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black opacity-50 z-40" (click)="toggleVersionHistory()"></div>
    }
  `
})
export class CollectionEditComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cms = inject(VertexClientService);
  private localeService = inject(LocaleService);

  // State
  slug = signal('');
  id = signal<string | null>(null);
  loading = signal(false); // Draft & Publish State
  documentStatus = signal<string>('draft');
  saveAction = signal<'draft' | 'publish' | null>(null);
  
  // Version History State
  showVersionHistory = signal(false);
  versions = signal<any[]>([]);
  loadingVersions = signal(false);

  // The magic dynamic form
  form: FormGroup = this.fb.group({});

  // Computed helpers
  isNew = () => !this.id();
  collection = () => this.cms.collections().find(c => c.slug === this.slug());
  draftsEnabled = computed(() => this.collection()?.drafts !== false);

  constructor() {
    // 1. Listen to URL params
    this.route.paramMap.subscribe(params => {
      this.slug.set(params.get('slug')!);
      this.id.set(params.get('id'));
      
      // 2. Rebuild form when route changes
      this.initForm();
      
      // 3. If editing, load data
      if (this.id()) {
        this.loadData();
      }
    });

    // 4. Watch for locale config changes and update localized field controls
    effect(() => {
      const supportedLocales = this.localeService.getSupportedLocales()();
      const col = this.collection();
      
      if (!col || supportedLocales.length <= 1) return; // Skip if config not loaded
      
      // Update localized field controls when locale config loads
      col.fields.forEach(field => {
        if (field.localized) {
          const localeGroup = this.form.get(field.name) as FormGroup;
          if (localeGroup) {
            // Add missing locale controls
            supportedLocales.forEach(locale => {
              if (!localeGroup.get(locale)) {
                localeGroup.addControl(locale, this.fb.control(''));
              }
            });
          }
        }
      });
    });
  }

  private initForm() {
    const col = this.collection();
    if (!col) return;

    const group: any = {};
    
    col.fields.forEach(field => {
      if (field.type === 'blocks') {
        // Initialize as an empty array. 
        // The BlocksFieldComponent's ngOnInit will handle population 
        // when the data arrives via patchValue/input binding.
        group[field.name] = this.fb.array([]);
      } else if (field.localized) {
        // For localized fields, create a FormGroup with controls for each locale
        const localeControls: any = {};
        // Get supported locales from LocaleService
        const supportedLocales = this.localeService.getSupportedLocales()();
        supportedLocales.forEach(locale => {
          localeControls[locale] = [''];
        });
        
        const validators = [];
        if (field.required) validators.push(Validators.required);
        
        group[field.name] = this.fb.group(localeControls, { validators });
      } else {
        const validators = [];
        if (field.required) validators.push(Validators.required);
        // Add more validators here later (min, max, email pattern)
        
        group[field.name] = [field.defaultValue || '', validators];
      }
    });

    this.form = this.fb.group(group);
  }

  private loadData() {
    this.loading.set(true);
    this.cms.findOne(this.slug(), this.id()!).subscribe({
      next: (data) => {
        // 1. We must manually reconstruct FormArrays before patching!
        // Because standard patchValue won't create the controls for us.
        this.rebuildFormArrays(data);
        
        // 2. Now patch
        this.form.patchValue(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private rebuildFormArrays(data: any) {
    const col = this.collection();
    if (!col) return;

    col.fields.forEach(field => {
      // Handle blocks fields (FormArrays)
      if (field.type === 'blocks' && Array.isArray(data[field.name])) {
        // We found a block field with data!
        const formArray = this.form.get(field.name) as any; // Cast to FormArray
        formArray.clear(); // Clear initial empty state

        // For each item in data, push a new FormGroup
        data[field.name].forEach((item: any) => {
          // Find the block definition to know its fields
          const blockMeta = (field.blocks as BlockMetadata[])?.find(b=> {return b.slug === item.blockType});
          if (blockMeta) {
             // Create the group (We duplicate the logic from BlocksFieldComponent here? 
             // Ideally we shouldn't duplicate logic.
             // But for now, let's keep it simple: Just push a group with the right controls)
             
             const group: any = { blockType: [item.blockType] };
             blockMeta.fields.forEach(f => {
               group[f.name] = [''];  // We don't need value here, patchValue will fill it
             });
             formArray.push(this.fb.group(group));
          }
        });
      }
      
      // Handle localized fields (FormGroups with locale keys)
      if (field.localized && data[field.name] && typeof data[field.name] === 'object') {
        const localeGroup = this.form.get(field.name) as FormGroup;
        
        if (localeGroup) {
          // Patch each locale control individually
          const localeData = data[field.name];
          Object.keys(localeData).forEach(locale => {
            const control = localeGroup.get(locale);
            if (control) {
              control.setValue(localeData[locale] || '');
            }
          });
        }
      }
    });
  }

  save() {
    if (this.form.invalid) return;
    
    this.loading.set(true);
    const data = this.form.value;
    const request = this.isNew()
      ? this.cms.create(this.slug(), data)
      : this.cms.update(this.slug(), this.id()!, data);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        // Navigate back to list on success
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        alert('Error saving document');
      }
    });
  }
  
    /**
   * Save the document as a draft
   */
  saveAsDraft() {
    if (this.form.invalid) return;
    
    this.saveAction.set('draft');
    this.loading.set(true);
    
    const formValue = { ...this.form.value, status: 'draft' };
    const currentId = this.id();
    
    if (!currentId) {
      // Create new draft
      this.cms.create(this.slug(), formValue).subscribe({
        next: (result: any) => {
          this.loading.set(false);
          this.saveAction.set(null);
          this.router.navigate(['/admin/collections', this.slug(), result._id]);
        },
        error: () => {
          this.loading.set(false);
          this.saveAction.set(null);
        }
      });
    } else {
      // Update existing as draft
      this.cms.update(this.slug(), currentId, formValue).subscribe({
        next: () => {
          this.loading.set(false);
          this.saveAction.set(null);
          this.documentStatus.set('draft');
        },
        error: () => {
          this.loading.set(false);
          this.saveAction.set(null);
        }
      });
    }
  }

  /**
   * Publish the document (save + publish)
   */
  publishDocument() {
    if (this.form.invalid) return;
    
    this.saveAction.set('publish');
    this.loading.set(true);
    
    const formValue = { ...this.form.value };
    const currentId = this.id();
    
    if (!currentId) {
      // Create new and immediately publish
      this.cms.create(this.slug(), formValue).subscribe({
        next: (result: any) => {
          this.cms.publish(this.slug(), result._id).subscribe({
            next: () => {
              this.loading.set(false);
              this.saveAction.set(null);
              this.router.navigate(['/admin/collections', this.slug(), result._id]);
            },
            error: () => {
              this.loading.set(false);
              this.saveAction.set(null);
            }
          });
        },
        error: () => {
          this.loading.set(false);
          this.saveAction.set(null);
        }
      });
    } else {
      // Save updates first, then publish
      this.cms.update(this.slug(), currentId, formValue).subscribe({
        next: () => {
          this.cms.publish(this.slug(), currentId).subscribe({
            next: () => {
              this.loading.set(false);
              this.saveAction.set(null);
              this.documentStatus.set('published');
            },
            error: () => {
              this.loading.set(false);
              this.saveAction.set(null);
            }
          });
        },
        error: () => {
          this.loading.set(false);
          this.saveAction.set(null);
        }
      });
    }
  }

  /**
   * Toggle version history sidebar
   */
  toggleVersionHistory() {
    this.showVersionHistory.update(show => !show);
    
    // Load versions when opening
    if (this.showVersionHistory() && this.id()) {
      this.loadVersionHistory();
    }
  }

  /**
   * Load version history for current document
   */
  loadVersionHistory() {
    const currentId = this.id();
    if (!currentId) return;
    
    this.loadingVersions.set(true);
    this.cms.getVersions(this.slug(), currentId).subscribe({
      next: (versions) => {
        this.versions.set(versions);
        this.loadingVersions.set(false);
      },
      error: () => {
        this.loadingVersions.set(false);
      }
    });
  }

  /**
   * Restore a specific version
   */
  restoreVersion(versionId: string) {
    const currentId = this.id();
    if (!currentId) return;
    
    if (!confirm('Are you sure you want to restore this version? This will replace the current content.')) {
      return;
    }
    
    this.cms.restoreVersion(this.slug(), currentId, versionId).subscribe({
      next: () => {
        // Reload the document data
        this.loadData();
        // Close the sidebar
        this.showVersionHistory.set(false);
      },
      error: (err) => {
        console.error('Failed to restore version:', err);
        alert('Failed to restore version');
      }
    });
  }
}