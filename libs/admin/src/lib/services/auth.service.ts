import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { lastValueFrom, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Track login state reactively
  isAuthenticated = signal<boolean>(false); // TODO: check if token is valid

  private get apiUrl() { return '/api/vertex/auth'; }

  login(credentials: { email: string; password: string }) {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.access_token);
          this.isAuthenticated.set(true);
          // Navigate to dashboard after login
          this.router.navigate(['/admin']);
        })
      );
  }

  logout() {
    localStorage.removeItem('vertex_token');
    this.isAuthenticated.set(false);
    this.router.navigate(['/admin/login']);
  }

  validate() {
    return this.http.post<{ valid: boolean }>(`${this.apiUrl}/validate`, {token: this.getToken()})
      .pipe(
        tap(response => {
          this.isAuthenticated.set(response.valid);
        })
      );
  }

  /**
   * Called on App Start.
   * Returns generic Observable so APP_INITIALIZER can wait for it.
   */
  checkSession(): Observable<boolean> {
    const token = this.getToken();
    
    // 1. If no token, we are definitely not logged in
    if (!token) {
      this.isAuthenticated.set(false);
      return of(false);
    }

    // 2. Verify with backend
    return this.http.post<{ valid: boolean }>(`${this.apiUrl}/validate`, {token: this.getToken()}).pipe(
      map(response => {
        const isValid = response.valid;
        this.isAuthenticated.set(isValid);
        
        if (!isValid) {
          this.logout(); // Clear invalid garbage from storage
        }
        return isValid;
      }),
      catchError(() => {
        // If the server is down or returns 401/500
        this.logout();
        return of(false);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('vertex_token');
  }

  private setToken(token: string) {
    localStorage.setItem('vertex_token', token);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('vertex_token');
  }
}

export function initializeAuth(authService: AuthService) {
  
  console.log('initializing auth');
  return lastValueFrom(authService.checkSession());
}