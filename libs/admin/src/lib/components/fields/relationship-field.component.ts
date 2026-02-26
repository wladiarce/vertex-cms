import { Component, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldOptions } from '@vertex-cms/common';
import { VertexAutocompleteComponent, AutocompleteItem } from '../ui/vertex-autocomplete.component';
import { VertexButtonComponent } from '../ui/vertex-button.component';
import { VertexClientService } from '../../services/vertex-client.service';

@Component({
  selector: 'vertex-relationship-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VertexAutocompleteComponent, VertexButtonComponent],
  template: `
    <div class="v-field-relationship">
      <vertex-autocomplete
        [formControl]="control"
        [label]="field.label || field.name"
        [placeholder]="'Search ' + field.relationTo + '...'"
        [multiple]="field.hasMany || false"
        [items]="suggestions()"
        [loading]="loading()"
        (search)="onSearch($event)"
      />
      
      <vertex-button
        type="button"
        variant="default"
        size="sm"
        (click)="openCreateModal()"
      >
        + Create new {{ field.relationTo }}
      </vertex-button>
    </div>
  `,
  styles: [`
    .v-field-relationship {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  `]
})
export class RelationshipFieldComponent implements OnInit {
  @Input() field!: FieldOptions & { name: string };
  @Input() group!: FormGroup;
  
  suggestions = signal<AutocompleteItem[]>([]);
  loading = signal(false);
  
  private cms = inject(VertexClientService);
  
  get control(): FormControl {
    return this.group.get(this.field.name) as FormControl;
  }
  
  ngOnInit() {
    // Relationship value normalization (populated objects → {id, displayName})
    // is now handled upstream by CollectionEditComponent.normalizeRelationshipData()
    // before patchValue is called, so writeValue receives the correct shape.
  }
  
  onSearch(query: string) {
    if (!query || query.length < 2) {
      this.suggestions.set([]);
      return;
    }
    
    this.loading.set(true);
    this.cms.searchRelationship(this.field.relationTo!, query).subscribe({
      next: (results: any[]) => {
        this.suggestions.set(results.map((r: any) => ({
          id: r._id ?? r.id,
          displayName: r.title ?? r.name ?? r.email ?? r._id ?? r.id,
          ...r
        })));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
  
  openCreateModal() {
    // TODO: Show modal with dynamic form for creating related document
    console.log('Open create modal for', this.field.relationTo);
  }
}
