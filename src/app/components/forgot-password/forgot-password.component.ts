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
        const apiMessage = typeof error?.error?.error === 'string' ? error.error.error : '';
        if (error.status === 429) {
          this.errorMessage = 'Has realizado varios intentos. Espera unos minutos antes de volver a solicitar el enlace.';
        } else if (error.status === 0) {
          this.errorMessage = 'No pudimos comunicarnos con el servidor. Comprueba que el backend esté encendido e inténtalo nuevamente.';
        } else if (apiMessage) {
          this.errorMessage = apiMessage;
        } else {
          this.errorMessage = 'El servidor devolvió una respuesta inválida. Comprueba la configuración de la API e inténtalo nuevamente.';
        }
      }
    });
  }
}
