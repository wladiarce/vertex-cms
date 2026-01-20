import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VertexClientService } from '../../services/vertex-client.service';
import { FieldRendererComponent } from '../../components/form/field-renderer.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { BlockMetadata } from '@vertex/common';

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
        </div>
        <div class="flex gap-3">
          <a [routerLink]="['../']" class="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">
            Cancel
          </a>
          <button (click)="save()" [disabled]="form.invalid || loading()" 
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {{ loading() ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </header>

      <form [formGroup]="form" class="space-y-6">
        @for (field of collection()?.fields; track field.name) {
          <vertex-field-renderer [field]="field" [group]="form" />
        }
      </form>
    </div>
  `
})
export class CollectionEditComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cms = inject(VertexClientService);

  // State
  slug = signal('');
  id = signal<string | null>(null);
  loading = signal(false);
  
  // The magic dynamic form
  form: FormGroup = this.fb.group({});

  // Computed helper
  isNew = () => !this.id();
  collection = () => this.cms.collections().find(c => c.slug === this.slug());

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
               group[f.name] = ['']; // We don't need value here, patchValue will fill it
             });
             formArray.push(this.fb.group(group));
          }
        });
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
}