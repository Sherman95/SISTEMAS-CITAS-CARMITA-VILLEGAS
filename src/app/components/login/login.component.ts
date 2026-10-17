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

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly visuals = inject(VisualAssetsService).assets;

  constructor() {
    this.loginForm = this.fb.group({
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { telefono, password } = this.loginForm.value;

    this.authService.login(telefono, password).subscribe({
      next: (res) => {
        this.isLoading = false;
        // Se define y almacena el token en memoria para evitar XSS temporalmente,
        // hasta que el usuario apruebe el almacenamiento definitivo (e.g. IndexedDB o HTTPOnly Cookies en backend).
        this.authService.setToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Error al iniciar sesión.';
      }
    });
  }
}
