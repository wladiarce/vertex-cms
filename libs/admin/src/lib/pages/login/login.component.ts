import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { VertexCardComponent } from '../../components/ui/vertex-card.component';
import { VertexLogoComponent } from '../../components/ui/vertex-logo.component';
import { VertexInputComponent } from '../../components/ui/vertex-input.component';
import { VertexButtonComponent } from '../../components/ui/vertex-button.component';

declare const lucide: any;

@Component({
  selector: 'vertex-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    VertexCardComponent,
    VertexLogoComponent,
    VertexInputComponent,
    VertexButtonComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  ngAfterViewInit() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      try {
        lucide.createIcons({ nameAttr: 'data-lucide' });
      } catch (e) {
        console.warn('Lucide icons not initialized:', e);
      }
    }
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
}