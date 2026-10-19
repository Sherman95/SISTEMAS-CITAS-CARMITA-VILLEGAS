import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { VisualAssetsService } from '../../services/visual-assets.service';
import { safeReturnUrl } from '../../utils/safe-return-url';

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
  legacyMode = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly visuals = inject(VisualAssetsService).assets;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
      telefono: [''],
      password: ['', Validators.required]
    });
  }

  toggleLegacyMode(): void {
    this.legacyMode = !this.legacyMode;
    this.errorMessage = '';
    this.showRecoveryPrompt = false;
    const email = this.loginForm.controls['email'];
    const phone = this.loginForm.controls['telefono'];
    if (this.legacyMode) {
      email.clearValidators();
      phone.setValidators([Validators.required, Validators.pattern('^(?:\\+?[0-9][0-9 .()-]{7,18})$')]);
    } else {
      phone.clearValidators();
      email.setValidators([Validators.required, Validators.email, Validators.maxLength(160)]);
    }
    email.updateValueAndValidity();
    phone.updateValueAndValidity();
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

    const password = this.loginForm.value.password;
    const request$ = this.legacyMode
      ? this.authService.legacyLogin(String(this.loginForm.value.telefono || '').trim(), password)
      : this.authService.login(normalizedEmail, password);

    request$.subscribe({
      next: (res) => {
        this.isLoading = false;
        // Se define y almacena el token en memoria para evitar XSS temporalmente,
        // hasta que el usuario apruebe el almacenamiento definitivo (e.g. IndexedDB o HTTPOnly Cookies en backend).
        this.authService.setToken(res.token);
        this.router.navigateByUrl(safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')));
      },
      error: (err) => {
        this.isLoading = false;
        this.showRecoveryPrompt = !this.legacyMode && (err.status === 401 || err.status === 403);
        this.errorMessage = this.showRecoveryPrompt
          ? 'El correo o la contraseña no coinciden.'
          : err.error?.error || (this.legacyMode ? 'El WhatsApp o la contraseña no coinciden.' : 'No pudimos iniciar sesión en este momento.');
      }
    });
  }
}
