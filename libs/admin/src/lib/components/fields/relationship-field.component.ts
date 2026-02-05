import { Component, Input, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldOptions } from '@vertex/common';
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
        [multiple]="field.relationMany || false"
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
    // Load initial selected documents when editing
    const value = this.control.value;
    if (value) {
      this.loadSelectedDocuments(value);
    }
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
          id: r._id,
          displayName: r.title || r.name || r._id,
          ...r
        })));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
  
  private loadSelectedDocuments(ids: string | string[]) {
    // Fetch full documents for selected IDs to display in autocomplete
    const idArray = Array.isArray(ids) ? ids : [ids];
    // TODO: Implement batch fetch endpoint or individual fetches
    // For now, this is a placeholder for when editing existing documents
  }
  
  openCreateModal() {
    // TODO: Show modal with dynamic form for creating related document
    console.log('Open create modal for', this.field.relationTo);
  }
}
