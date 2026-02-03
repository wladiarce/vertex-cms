import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Simple: just check if token exists in localStorage
  // No platform checks needed since admin is CSR-only
  isAuthenticated = signal<boolean>(!!localStorage.getItem('vertex_token'));

  private get apiUrl() { return '/api/vertex/auth'; }
  private validationStarted = false;

  constructor() {}

  /**
   * Lazy validation - called by guard or manually
   * Returns Observable that completes when validation is done
   */
  ensureValidated(): Observable<boolean> {
    // If already validated or no token, return current state immediately
    if (this.validationStarted || !this.hasToken()) {
      return of(this.isAuthenticated());
    }
    
    // Start validation
    this.validationStarted = true;
    return this.checkSession();
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.access_token);
          this.isAuthenticated.set(true);
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
   * Validates the current token with the backend.
   */
  checkSession(): Observable<boolean> {
    const token = this.getToken();
    
    if (!token) {
      this.isAuthenticated.set(false);
      return of(false);
    }

    return this.http.post<{ valid: boolean }>(`${this.apiUrl}/validate`, {token: this.getToken()}).pipe(
      map(response => {
        const isValid = response.valid;
        this.isAuthenticated.set(isValid);
        
        if (!isValid) {
          this.logout();
        }
        return isValid;
      }),
      catchError((error) => {
        console.error('checkSession ERROR:', error);
        this.logout();
        return of(false);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('vertex_token');
  }

  getUserInfo(): any {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload;
  }

  private setToken(token: string) {
    localStorage.setItem('vertex_token', token);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('vertex_token');
  }
}