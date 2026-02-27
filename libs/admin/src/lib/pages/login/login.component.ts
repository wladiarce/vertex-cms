import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { VertexClientService } from '../../services/vertex-client.service';
import { VertexCardComponent } from '../../components/ui/vertex-card.component';
import { VertexLogoComponent } from '../../components/ui/vertex-logo.component';
import { VertexInputComponent } from '../../components/ui/vertex-input.component';
import { VertexButtonComponent } from '../../components/ui/vertex-button.component';
import { LucideAngularModule, AlertCircle, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'vertex-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    VertexCardComponent,
    VertexLogoComponent,
    VertexInputComponent,
    VertexButtonComponent,
    LucideAngularModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  readonly AlertCircle = AlertCircle;
  readonly CheckCircle = CheckCircle;

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  public vertex = inject(VertexClientService);

  loading = signal(false);
  error = signal('');
  successMessage = signal('');
  
  showForgot = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  toggleForgot() {
    this.showForgot.set(!this.showForgot());
    this.error.set('');
    this.successMessage.set('');
  }

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

  forgotSubmit() {
    if (this.forgotForm.invalid) return;

    this.loading.set(true);
    this.error.set('');
    this.successMessage.set('');

    this.vertex.forgotPassword(this.forgotForm.value.email!).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('If that email is registered, you will receive a reset link shortly.');
        this.forgotForm.reset();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to request reset');
      }
    });
  }
}