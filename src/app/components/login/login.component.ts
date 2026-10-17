import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { VisualAssetsService } from '../../services/visual-assets.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.reference.html',
  styleUrls: ['./login.reference.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showRecoveryPrompt = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly visuals = inject(VisualAssetsService).assets;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    const normalizedEmail = String(this.loginForm.controls['email'].value || '').trim().toLowerCase();
    this.loginForm.controls['email'].setValue(normalizedEmail, { emitEvent: false });

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.showRecoveryPrompt = false;

    const email = normalizedEmail;
    const password = this.loginForm.value.password;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.isLoading = false;
        // Se define y almacena el token en memoria para evitar XSS temporalmente,
        // hasta que el usuario apruebe el almacenamiento definitivo (e.g. IndexedDB o HTTPOnly Cookies en backend).
        this.authService.setToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.showRecoveryPrompt = err.status === 401 || err.status === 403;
        this.errorMessage = this.showRecoveryPrompt
          ? 'El correo o la contraseña no coinciden.'
          : err.error?.error || 'No pudimos iniciar sesión en este momento.';
      }
    });
  }
}
