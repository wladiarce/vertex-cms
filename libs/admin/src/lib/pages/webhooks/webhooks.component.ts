import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VertexClientService } from '../../services/vertex-client.service';
import { VertexButtonComponent } from '../../components/ui/vertex-button.component';
import { VertexCardComponent } from '../../components/ui/vertex-card.component';
import { VertexBadgeComponent } from '../../components/ui/vertex-badge.component';

@Component({
  selector: 'vertex-webhooks',
  standalone: true,
  imports: [CommonModule, FormsModule, VertexButtonComponent, VertexCardComponent, VertexBadgeComponent],
  template: `
    <header class="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-bold">Webhooks</h1>
        <p class="text-[var(--text-muted)] text-sm font-mono mt-1">Send real-time updates to external services</p>
      </div>
      <div>
        <vertex-button [variant]="'primary'" (click)="openForm()" *ngIf="!showForm()">
          Add Webhook
        </vertex-button>
      </div>
    </header>

    <!-- Create/Edit Form -->
    <vertex-card *ngIf="showForm()" class="mb-8 block">
      <h2 class="text-xl font-bold mb-4">{{ editingId() ? 'Edit Webhook' : 'Create Webhook' }}</h2>
      <form (submit)="saveWebhook($event)" class="space-y-4">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input type="text" [(ngModel)]="formName" name="name" required class="w-full p-2 border rounded" placeholder="e.g. Vercel Production Build">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Target URL</label>
            <input type="url" [(ngModel)]="formUrl" name="url" required class="w-full p-2 border rounded" placeholder="https://api.example.com/webhook">
          </div>
        </div>

        <div>
           <label class="block text-sm font-medium mb-1">Secret (Optional)</label>
           <input type="text" [(ngModel)]="formSecret" name="secret" class="w-full p-2 border rounded" placeholder="HMAC SHA-256 secret for verifying payloads">
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Events (comma-separated)</label>
          <input type="text" [(ngModel)]="formEvents" name="events" class="w-full p-2 border rounded" placeholder="e.g. pages:create, pages:update (use *:* for all)">
        </div>

        <div class="flex items-center gap-2 mt-4">
          <input type="checkbox" id="active" [(ngModel)]="formActive" name="active" class="w-4 h-4">
          <label for="active" class="text-sm font-medium">Active (Webhooks will be dispatched)</label>
        </div>

        <div class="flex gap-2 pt-4">
          <vertex-button type="submit" [variant]="'primary'">Save</vertex-button>
          <vertex-button type="button" [variant]="'default'" (click)="closeForm()">Cancel</vertex-button>
        </div>
      </form>
    </vertex-card>

    <!-- Webhooks List -->
    <vertex-card [padding]="false">
      <table class="v-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Name</th>
            <th>URL</th>
            <th>Events</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let webhook of webhooks()">
            <td>
              <vertex-badge [status]="webhook.active ? 'published' : 'draft'">
                {{ webhook.active ? 'ACTIVE' : 'INACTIVE' }}
              </vertex-badge>
            </td>
            <td class="font-medium">{{ webhook.name }}</td>
            <td class="font-mono text-xs text-gray-500 truncate max-w-[200px]" [title]="webhook.url">{{ webhook.url }}</td>
            <td class="font-mono text-xs">{{ webhook.events }}</td>
            <td class="flex gap-2">
              <button class="text-blue-600 hover:text-blue-800 text-sm font-medium" (click)="testWebhook(webhook.id)">
                Test
              </button>
              <button class="text-gray-600 hover:text-gray-800 text-sm font-medium" (click)="viewLogs(webhook.id)">
                Logs
              </button>
              <button class="text-blue-600 hover:text-blue-800 text-sm font-medium" (click)="editWebhook(webhook)">
                Edit
              </button>
              <button class="text-red-600 hover:text-red-800 text-sm font-medium" (click)="deleteWebhook(webhook.id)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="webhooks().length === 0" class="text-center py-12 text-[var(--text-muted)]">
        No Webhooks configured.
      </div>
    </vertex-card>

    <!-- Logs Modal -->
    <div *ngIf="showLogs()" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div class="flex justify-between items-center p-4 border-b">
          <h2 class="text-lg font-bold">Delivery Logs</h2>
          <button (click)="closeLogs()" class="text-gray-500 hover:text-black">&times;</button>
        </div>
        
        <div class="p-4 overflow-y-auto flex-1 bg-gray-50">
           <table class="w-full text-left text-sm" *ngIf="logs().length > 0">
             <thead class="bg-gray-200">
               <tr>
                 <th class="p-2">Status</th>
                 <th class="p-2">Date</th>
                 <th class="p-2">Event</th>
                 <th class="p-2">Duration</th>
               </tr>
             </thead>
             <tbody>
               <ng-container *ngFor="let log of logs()">
                 <tr class="border-b bg-white cursor-pointer hover:bg-gray-50" (click)="log.expanded = !log.expanded">
                   <td class="p-2">
                      <span [class.text-green-600]="log.success" [class.text-red-600]="!log.success" class="font-bold">
                        {{ log.statusCode || 'ERR' }}
                      </span>
                   </td>
                   <td class="p-2 text-gray-500 whitespace-nowrap">{{ log.createdAt | date:'short' }}</td>
                   <td class="p-2 font-mono text-xs">{{ log.event }}</td>
                   <td class="p-2 text-gray-500">{{ log.durationMs }}ms</td>
                 </tr>
                 <tr *ngIf="log.expanded" class="bg-gray-100">
                   <td colspan="4" class="p-4">
                     <div class="grid grid-cols-2 gap-4">
                        <div>
                          <p class="text-xs font-bold text-gray-500 mb-1">Request Payload</p>
                          <pre class="bg-gray-800 text-green-400 p-2 text-xs overflow-x-auto rounded max-h-40">{{ log.requestPayload | json }}</pre>
                        </div>
                        <div>
                          <p class="text-xs font-bold text-gray-500 mb-1">Response Body</p>
                          <pre class="bg-gray-800 text-gray-300 p-2 text-xs overflow-x-auto rounded max-h-40">{{ log.responseBody }}</pre>
                        </div>
                     </div>
                   </td>
                 </tr>
               </ng-container>
             </tbody>
           </table>
           <div *ngIf="logs().length === 0" class="text-center py-8 text-gray-500">
             No logs available for this webhook.
           </div>
        </div>
      </div>
    </div>
  `
})
export class WebhooksComponent implements OnInit {
  private cms = inject(VertexClientService);

  webhooks = signal<any[]>([]);
  
  showForm = signal(false);
  editingId = signal<string | null>(null);

  formName = '';
  formUrl = '';
  formSecret = '';
  formEvents = '';
  formActive = true;

  showLogs = signal(false);
  logs = signal<any[]>([]);

  ngOnInit() {
    this.loadWebhooks();
  }

  loadWebhooks() {
    this.cms.listWebhooks().subscribe((res: any) => {
      // res is from findAll, so it's { docs: [], totalDocs: ... }
      this.webhooks.set(res.docs || []);
    });
  }

  openForm() {
    this.formName = '';
    this.formUrl = '';
    this.formSecret = '';
    this.formEvents = '*:*';
    this.formActive = true;
    this.editingId.set(null);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  editWebhook(webhook: any) {
    this.formName = webhook.name;
    this.formUrl = webhook.url;
    this.formSecret = webhook.secret || '';
    this.formEvents = webhook.events || '';
    this.formActive = webhook.active !== false; // handle undefined as true
    this.editingId.set(webhook.id || webhook._id);
    this.showForm.set(true);
  }

  saveWebhook(event: Event) {
    event.preventDefault();
    if (!this.formName || !this.formUrl || !this.formEvents) return;

    const payload = {
      name: this.formName,
      url: this.formUrl,
      secret: this.formSecret,
      events: this.formEvents,
      active: this.formActive
    };

    const id = this.editingId();
    if (id) {
      this.cms.updateWebhook(id, payload).subscribe(() => {
        this.closeForm();
        this.loadWebhooks();
      });
    } else {
      this.cms.createWebhook(payload).subscribe(() => {
        this.closeForm();
        this.loadWebhooks();
      });
    }
  }

  testWebhook(id: string) {
    this.cms.testWebhook(id).subscribe((res) => {
      if(res.success) {
        alert('Test webhook dispatched. Check logs shortly.');
      } else {
         alert('Failed to dispatch test webhook.');
      }
    });
  }

  viewLogs(id: string) {
    this.cms.getWebhookLogs(id, 50).subscribe((res: any) => {
      this.logs.set((res.docs || []).map((l: any) => ({ ...l, expanded: false })));
      this.showLogs.set(true);
    });
  }

  closeLogs() {
    this.showLogs.set(false);
    this.logs.set([]);
  }

  deleteWebhook(id: string) {
    if (confirm('Are you sure you want to delete this webhook?')) {
      this.cms.deleteWebhook(id).subscribe(() => {
        this.loadWebhooks();
      });
    }
  }
}
