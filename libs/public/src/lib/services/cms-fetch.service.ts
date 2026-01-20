import { Injectable, inject, makeStateKey, TransferState } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CmsFetchService {
  private http = inject(HttpClient);
  private transferState = inject(TransferState);

  // Helper to make API calls that transfer their result to the client
  get<T>(url: string, params: any = {}): Observable<T> {
    // 1. Create a unique key for this request (e.g., 'GET:/api/content/pages:home')
    const key = makeStateKey<T>(`${url}:${JSON.stringify(params)}`);

    // 2. Check if the Server already put data in the state (Client-side check)
    if (this.transferState.hasKey(key)) {
      const data = this.transferState.get(key, null as T);
      this.transferState.remove(key); // clear it so we don't cache forever
      return of(data!);
    }

    // 3. If no data, fetch from API
    return this.http.get<T>(url, { params }).pipe(
      tap(data => {
        // 4. If we are on the Server, save the data to state
        this.transferState.set(key, data);
      })
    );
  }
}