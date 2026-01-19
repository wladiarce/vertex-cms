import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'vertex-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold tracking-wider">VERTEX <span class="text-blue-600">CMS</span></h1>
          <p class="text-gray-500 text-sm mt-2">Sign in to manage your content</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" formControlName="email" 
                   class="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500">
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" formControlName="password" 
                   class="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500">
          </div>

          <button type="submit" [disabled]="form.invalid || loading()"
                  class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {{ loading() ? 'Signing in...' : 'Sign In' }}
          </button>
          
          @if (error()) {
            <p class="mt-4 text-red-500 text-sm text-center">{{ error() }}</p>
          }
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.form.value as any).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.loading.set(false);
        this.error.set('Invalid credentials');
      }
    });
  }
}