import { Injectable, inject, makeStateKey, TransferState, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CmsFetchService {
  private http = inject(HttpClient);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);
  private isServer = isPlatformServer(this.platformId);

  // API base URL: different for server vs browser
  private get apiBaseUrl(): string {
    if (this.isServer) {
      // Server-side: use Docker internal network
      return 'http://vertex-api:3001';
    } else {
      // Browser: use relative URL (goes through Nginx)
      return '';
    }
  }

  /**
   * Helper to make API calls with automatic URL resolution
   * - On server (SSR): uses http://vertex-api:3001/api/...
   * - In browser: uses /api/... (relative, goes through Nginx)
   */
  get<T>(url: string, params: any = {}): Observable<T> {
    // Resolve the full URL based on platform
    const resolvedUrl = this.resolveUrl(url);

    // 1. Create a unique key for this request
    const key = makeStateKey<T>(`${url}:${JSON.stringify(params)}`);

    // 2. Check if the Server already put data in the state (Client-side check)
    if (this.transferState.hasKey(key)) {
      const data = this.transferState.get(key, null as T);
      this.transferState.remove(key); // clear it so we don't cache forever
      return of(data!);
    }

    // 3. If no data, fetch from API
    return this.http.get<T>(resolvedUrl, { params }).pipe(
      tap(data => {
        // 4. If we are on the Server, save the data to state
        this.transferState.set(key, data);
      })
    );
  }

  /**
   * Resolves URL to absolute path based on platform
   */
  private resolveUrl(url: string): string {
    // If already absolute, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Otherwise, prepend the base URL
    return `${this.apiBaseUrl}${url}`;
  }
}