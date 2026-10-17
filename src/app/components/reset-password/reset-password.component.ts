import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VisualAssetsService } from '../../services/visual-assets.service';

const matchingPasswords = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmation = control.get('confirmation')?.value;
  return password && confirmation && password !== confirmation ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['../login/login.reference.scss', '../forgot-password/forgot-password.component.scss', './reset-password.component.scss']
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  readonly visuals = inject(VisualAssetsService).assets;
  readonly token = this.route.snapshot.queryParamMap.get('token')?.trim().toLowerCase() || '';
  readonly tokenIsValid = /^[a-f0-9]{64}$/.test(this.token);
  readonly form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
    confirmation: ['', Validators.required]
  }, { validators: matchingPasswords });

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  onSubmit(): void {
    if (!this.tokenIsValid || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.authService.resetPassword(this.token, this.form.controls.password.value || '').subscribe({
      next: ({ message }) => {
        this.isLoading = false;
        this.successMessage = message;
        this.form.disable();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'No pudimos actualizar la contraseña.';
      }
    });
  }
}
