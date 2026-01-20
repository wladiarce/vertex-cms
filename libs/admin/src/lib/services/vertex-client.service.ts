import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CollectionMetadata } from '@vertex/common';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class VertexClientService {
  private http = inject(HttpClient);
  
  // Signals to hold the global state
  // We use a signal so the Sidebar automatically updates when config loads
  collections = signal<CollectionMetadata[]>([]);
  
  // Base API URL (proxy is handled by Nx in dev, or relative path in prod)
  private apiUrl = '/api'; 

  /**
   * 1. Initialize the Admin
   * Fetches the schema to build the UI
   */
  loadConfig() {
    return this.http.get<{ collections: CollectionMetadata[] }>(`${this.apiUrl}/vertex/config`)
      .pipe(
        tap(response => {
          this.collections.set(response.collections);
        })
      );
  }

  /**
   * 2. Generic CRUD Methods
   */
  getAll(slug: string, page = 1, limit = 10) {
    return this.http.get<any>(`${this.apiUrl}/content/${slug}`, {
      params: { page, limit }
    });
  }

  findOne(slug: string, id: string) {
    return this.http.get<any>(`${this.apiUrl}/content/${slug}/${id}`);
  }

  create(slug: string, data: any) {
    return this.http.post(`${this.apiUrl}/content/${slug}`, data);
  }

  update(slug: string, id: string, data: any) {
    return this.http.patch(`${this.apiUrl}/content/${slug}/${id}`, data);
  }

  delete(slug: string, id: string) {
    return this.http.delete(`${this.apiUrl}/content/${slug}/${id}`);
  }

  /**
   * 3. Upload Methods
   */
  upload(formData: any) {
    return this.http.post<any>(`${this.apiUrl}/vertex/upload`, formData);
    // return this.http.post<any>(`http://localhost:3000/api/vertex/upload`, formData);
  }
}