import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VertexClientService } from '../../services/vertex-client.service';
import { VertexButtonComponent } from '../../components/ui/vertex-button.component';
import { VertexCardComponent } from '../../components/ui/vertex-card.component';

@Component({
  selector: 'vertex-api-tokens',
  standalone: true,
  imports: [CommonModule, FormsModule, VertexButtonComponent, VertexCardComponent],
  template: `
    <header class="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-bold">API Tokens</h1>
        <p class="text-[var(--text-muted)] text-sm font-mono mt-1">Manage tokens for external API access</p>
      </div>
      <div>
        <vertex-button [variant]="'primary'" (click)="showCreateForm.set(true)" *ngIf="!showCreateForm()">
          Generate Token
        </vertex-button>
      </div>
    </header>

    <div *ngIf="newRawToken()" class="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md mb-6 relative">
      <h3 class="font-bold mb-2">Token Generated Successfully!</h3>
      <p class="text-sm mb-4">Please copy this token now. You will not be able to see it again.</p>
      <div class="bg-white border border-green-300 p-3 rounded font-mono text-lg break-all">
        {{ newRawToken() }}
      </div>
      <button class="absolute top-4 right-4 text-green-600 hover:text-green-900" (click)="newRawToken.set(null)">
        Close
      </button>
    </div>

    <vertex-card *ngIf="showCreateForm()" class="mb-8 block">
      <h2 class="text-xl font-bold mb-4">Create New API Token</h2>
      <form (submit)="createToken($event)" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Token Name</label>
          <input type="text" [(ngModel)]="newTokenName" name="name" required class="w-full p-2 border rounded" placeholder="e.g. Frontend App">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Scopes (comma-separated)</label>
          <input type="text" [(ngModel)]="newTokenScopes" name="scopes" class="w-full p-2 border rounded" placeholder="e.g. pages:read, posts:read (leave empty for *.*)">
          <p class="text-xs text-gray-500 mt-1">Leave empty or use *:* for full access. E.g. <code>collection_slug:read</code> or <code>collection_slug:write</code></p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Expiration (optional)</label>
          <input type="datetime-local" [(ngModel)]="newTokenExpiresAt" name="expiresAt" class="w-full p-2 border rounded">
        </div>
        
        <div class="flex gap-2">
          <vertex-button type="submit" [variant]="'primary'">Generate</vertex-button>
          <vertex-button type="button" [variant]="'default'" (click)="showCreateForm.set(false)">Cancel</vertex-button>
        </div>
      </form>
    </vertex-card>

    <vertex-card [padding]="false">
      <table class="v-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Prefix</th>
            <th>Scopes</th>
            <th>Created</th>
            <th>Last Used</th>
            <th>Expires</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        @for (token of tokens(); track token.id) {
          <tr>
            <td class="font-medium">{{ token.name }}</td>
            <td class="font-mono text-xs text-gray-500">{{ token.prefix }}...</td>
            <td class="font-mono text-xs">{{ token.scopes }}</td>
            <td class="text-sm text-gray-500">{{ token.createdAt | date:'short' }}</td>
            <td class="text-sm text-gray-500">{{ token.lastUsedAt ? (token.lastUsedAt | date:'short') : 'Never' }}</td>
            <td class="text-sm text-gray-500">
              <span *ngIf="token.expiresAt" [class.text-red-500]="isExpired(token.expiresAt)">
                {{ token.expiresAt | date:'short' }}
              </span>
              <span *ngIf="!token.expiresAt">Never</span>
            </td>
            <td>
              <button class="text-red-600 hover:text-red-800 text-sm font-medium" 
                      (click)="revokeToken(token.id)"
                      [disabled]="token.revoked">
                {{ token.revoked ? 'Revoked' : 'Revoke' }}
              </button>
            </td>
          </tr>
        }
        </tbody>
      </table>
    @if(tokens().length === 0) {
      <div class="text-center py-12 text-[var(--text-muted)]">
        No API tokens found. Create one to allow external access.
      </div>
    }
    </vertex-card>
  `
})
export class ApiTokensComponent implements OnInit {
  private cms = inject(VertexClientService);

  tokens = signal<any[]>([]);
  showCreateForm = signal(false);
  newRawToken = signal<string | null>(null);

  newTokenName = '';
  newTokenScopes = '';
  newTokenExpiresAt = '';

  ngOnInit() {
    this.loadTokens();
  }

  loadTokens() {
    this.cms.listTokens().subscribe(tokens => {
      this.tokens.set(tokens);
    });
  }

  createToken(event: Event) {
    event.preventDefault();
    if (!this.newTokenName) return;

    const payload = {
      name: this.newTokenName,
      scopes: this.newTokenScopes || '*:*',
      expiresAt: this.newTokenExpiresAt ? new Date(this.newTokenExpiresAt).toISOString() : undefined
    };

    this.cms.createToken(payload).subscribe(res => {
      this.newRawToken.set(res.rawToken);
      this.showCreateForm.set(false);
      this.newTokenName = '';
      this.newTokenScopes = '';
      this.newTokenExpiresAt = '';
      this.loadTokens();
    });
  }

  revokeToken(id: string) {
    if (confirm('Are you sure you want to revoke this token? Any application using it will lose access immediately.')) {
      this.cms.revokeToken(id).subscribe(() => {
        this.loadTokens();
      });
    }
  }

  isExpired(dateString: string): boolean {
    return new Date(dateString) < new Date();
  }
}
