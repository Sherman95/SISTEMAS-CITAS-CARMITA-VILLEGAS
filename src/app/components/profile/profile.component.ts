import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';
import { VisualAssetsService } from '../../services/visual-assets.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, MobileNavComponent, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss', './profile.luxury-extension.scss']
})
export class ProfileComponent implements OnInit {
  profile: any = null;
  isLoading = true;
  errorMessage = '';
  emailSuccessMessage = '';
  emailErrorMessage = '';
  isSavingEmail = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  readonly visuals = inject(VisualAssetsService).assets;
  readonly recoveryEmailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    current_password: ['', Validators.required]
  });

  get profileInitials(): string {
    const names = this.profile?.nombre_completo?.trim().split(/\s+/).filter(Boolean) || [];
    return names.slice(0, 2).map((name: string) => name[0]).join('').toUpperCase() || 'S';
  }

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.recoveryEmailForm.controls.email.setValue(data.email || '');
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'No se pudo cargar la información.';
        this.isLoading = false;
      }
    });
  }

  saveRecoveryEmail(): void {
    if (this.recoveryEmailForm.invalid) {
      this.recoveryEmailForm.markAllAsTouched();
      return;
    }

    this.isSavingEmail = true;
    this.emailSuccessMessage = '';
    this.emailErrorMessage = '';
    const email = this.recoveryEmailForm.controls.email.value || '';
    const password = this.recoveryEmailForm.controls.current_password.value || '';
    this.authService.updateRecoveryEmail(email, password).subscribe({
      next: (response) => {
        this.isSavingEmail = false;
        this.profile = { ...this.profile, email: response.email };
        this.recoveryEmailForm.controls.current_password.reset();
        this.emailSuccessMessage = response.message;
      },
      error: (error) => {
        this.isSavingEmail = false;
        this.emailErrorMessage = error.error?.error || 'No se pudo guardar el correo.';
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
