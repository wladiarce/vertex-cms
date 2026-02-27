import { Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VertexClientService } from '../../services/vertex-client.service';
import { VertexCardComponent } from '../../components/ui/vertex-card.component';
import { VertexLogoComponent } from '../../components/ui/vertex-logo.component';
import { VertexInputComponent } from '../../components/ui/vertex-input.component';
import { VertexButtonComponent } from '../../components/ui/vertex-button.component';

declare const lucide: any;

@Component({
  selector: 'vertex-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    VertexCardComponent,
    VertexLogoComponent,
    VertexInputComponent,
    VertexButtonComponent
  ],
  template: `
    <div class="min-h-screen bg-[var(--bg-app)] bg-grid-pattern flex items-center justify-center p-4">
      <vertex-card [padding]="false" class="w-full max-w-md">
        <div class="p-8 pb-6 text-center border-b border-[var(--border-dim)]">
          <div class="flex justify-center mb-4">
            <vertex-logo [size]="'md'"></vertex-logo>
          </div>
          <h2 class="text-[var(--text-primary)] text-lg font-mono">Reset Password</h2>
          <p class="text-[var(--text-muted)] text-xs font-mono mt-1">Enter your new password below</p>
        </div>

        <div class="p-8">
          @if (!success()) {
            <form [formGroup]="form" (ngSubmit)="submit()">
              <div class="mb-4">
                <vertex-input
                  [label]="'New Password'"
                  [type]="'password'"
                  [placeholder]="'••••••••'"
                  formControlName="password"
                ></vertex-input>
              </div>
              
              <div class="mb-6">
                <vertex-input
                  [label]="'Confirm Password'"
                  [type]="'password'"
                  [placeholder]="'••••••••'"
                  formControlName="confirmPassword"
                ></vertex-input>
              </div>

              <vertex-button
                [variant]="'primary'"
                [type]="'submit'"
                [disabled]="form.invalid || loading()"
                [fluid]="true"
                class="w-full"
              >
                {{ loading() ? 'Resetting...' : 'Reset Password' }}
              </vertex-button>
            </form>
          } @else {
            <div class="text-center space-y-4">
              <div class="p-3 bg-green-500/10 border border-green-500/20 rounded flex items-center justify-center gap-2 text-sm text-green-500 mb-6">
                <i data-lucide="check-circle" class="w-4 h-4"></i>
                <span class="font-mono text-xs">Password reset successfully!</span>
              </div>
              
              <vertex-button
                [variant]="'primary'"
                [routerLink]="['/admin/login']"
                [fluid]="true"
                class="w-full"
              >
                Go to Login
              </vertex-button>
            </div>
          }

          @if (error()) {
            <div class="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2 text-sm text-[var(--primary)]">
              <i data-lucide="alert-circle" class="w-4 h-4"></i>
              <span class="font-mono text-xs">{{ error() }}</span>
            </div>
          }
        </div>
      </vertex-card>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ResetPasswordComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vertex = inject(VertexClientService);

  loading = signal(false);
  error = signal('');
  success = signal(false);
  token = '';

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.error.set('Invalid or missing reset token.');
    }
  }

  ngAfterViewInit() {
    // this.refreshIcons();
  }

  refreshIcons() {
    // if (typeof lucide !== 'undefined') {
    //   try {
    //     lucide.createIcons({ nameAttr: 'data-lucide' });
    //   } catch (e) {
    //     console.warn('Lucide icons not initialized:', e);
    //   }
    // }
  }

  passwordMatchValidator(g: any) {
    return g.get('password').value === g.get('confirmPassword').value
       ? null : { mismatch: true };
  }

  submit() {
    if (this.form.invalid || !this.token) return;

    this.loading.set(true);
    this.error.set('');

    this.vertex.resetPassword(this.token, this.form.value.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.refreshIcons(), 0);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to reset password');
      }
    });
  }
}
