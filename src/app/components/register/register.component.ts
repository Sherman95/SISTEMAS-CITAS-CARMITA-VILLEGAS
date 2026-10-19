import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { validateEcuadorDocument } from '../../utils/ecuador-id';

const ecuadorDocumentValidator = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) return null;
  return validateEcuadorDocument(value).valid ? null : { documentoInvalido: true };
};

const passwordsMatchValidator = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirm = group.get('password_confirm')?.value;
  if (!password || !confirm) return null;
  return password === confirm ? null : { passwordsMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  constructor() {
    this.registerForm = this.fb.group(
      {
        nombre_completo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(160)]],
        documento: ['', [Validators.required, ecuadorDocumentValidator]],
        telefono: ['', [Validators.required, Validators.pattern('^\\+?[0-9][0-9 .()-]{7,18}$')]],
        email: ['', [Validators.required, Validators.email]],
        direccion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
        password_confirm: ['', [Validators.required]],
        privacy_accepted: [false, [Validators.requiredTrue]]
      },
      { validators: passwordsMatchValidator }
    );
  }

  get documentError(): string {
    const control = this.registerForm.get('documento');
    if (!control?.touched || !control.invalid) return '';
    if (control.hasError('required')) return 'La cédula o RUC es obligatorio.';
    if (control.hasError('documentoInvalido')) {
      return validateEcuadorDocument(control.value).error || 'La cédula o RUC no es válido.';
    }
    return '';
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { nombre_completo, documento, telefono, email, direccion, password, password_confirm, privacy_accepted } =
      this.registerForm.value;

    this.authService
      .register({
        nombre_completo,
        documento,
        telefono,
        email,
        direccion,
        password,
        password_confirm,
        privacy_accepted
      })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = response?.message || 'Cuenta creada. Revisa tu correo para verificar tu cuenta antes de iniciar sesión.';
          this.registerForm.disable();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'Error al crear la cuenta.';
        }
      });
  }
}
