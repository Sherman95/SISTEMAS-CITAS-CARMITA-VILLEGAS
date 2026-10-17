import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VisualAssetsService } from '../../services/visual-assets.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../login/login.reference.scss', './forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  readonly visuals = inject(VisualAssetsService).assets;
  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]]
  });

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor() {
    const email = (this.route.snapshot.queryParamMap.get('email') || '').trim().toLowerCase();
    if (email) this.form.controls.email.setValue(email);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const email = (this.form.controls.email.value || '').trim().toLowerCase();
    this.authService.requestPasswordReset(email).subscribe({
      next: ({ message }) => {
        this.isLoading = false;
        this.successMessage = message;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.status === 429
          ? 'Has realizado varios intentos. Espera unos minutos antes de volver a solicitar el enlace.'
          : error.error?.error || 'No pudimos procesar la solicitud en este momento.';
      }
    });
  }
}
