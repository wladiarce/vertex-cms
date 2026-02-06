import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CollectionMetadata, Upload } from '@vertex/common';
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
  getAll(slug: string, page = 1, limit = 10, status?: string) {
    const params: any = { page, limit };
    if (status) {
      params.status = status;
    }
    return this.http.get<any>(`${this.apiUrl}/content/${slug}`, { params });
  }

  findOne(slug: string, id: string, populate?: string) {
    // Admin needs raw locale objects, not transformed strings
    const params: any = { raw: 'true' };
    if (populate) {
      params.populate = populate;
    }
    return this.http.get<any>(`${this.apiUrl}/content/${slug}/${id}`, { params });
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
    return this.http.post<any>(`${this.apiUrl}/vertex/media`, formData);
  }

  /**
   * 4. Draft/Publish Methods
   */
  publish(slug: string, id: string) {
    return this.http.patch(`${this.apiUrl}/content/${slug}/${id}/publish`, {});
  }

  unpublish(slug: string, id: string) {
    return this.http.patch(`${this.apiUrl}/content/${slug}/${id}/unpublish`, {});
  }

  getVersions(slug: string, id: string) {
    return this.http.get<any[]>(`${this.apiUrl}/content/${slug}/${id}/versions`);
  }

  restoreVersion(slug: string, id: string, versionId: string) {
    return this.http.post(`${this.apiUrl}/content/${slug}/${id}/restore/${versionId}`, {});
  }

  /**
   * 5. Relationship Search
   */
  searchRelationship(slug: string, searchTerm: string, limit = 10) {
    return this.http.get<any[]>(`${this.apiUrl}/content/${slug}/search`, {
      params: { q: searchTerm, limit: limit.toString() }
    });
  }

  /**
   * 6. Media Library Methods
   */
  getMedia(page = 1, limit = 24, type?: string, search?: string) {
    const params: any = { page, limit };
    if (type) params.type = type;
    if (search) params.search = search;
    
    return this.http.get<any>(`${this.apiUrl}/vertex/media`, { params });
  }

  getMediaById(id: string) {
    return this.http.get<Upload>(`${this.apiUrl}/vertex/media/${id}`);
  }

  updateMedia(id: string, data: { alt?: string; caption?: string; metadata?: any }) {
    return this.http.patch<Upload>(`${this.apiUrl}/vertex/media/${id}`, data);
  }

  bulkDeleteMedia(ids: string[]) {
    return this.http.request('delete', `${this.apiUrl}/vertex/media`, {
      body: { ids }
    });
  }
}