import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';
import { VisualAssetsService } from '../../services/visual-assets.service';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { validateEcuadorDocument } from '../../utils/ecuador-id';
import { PushNotificationsService } from '../../services/push-notifications.service';
import { NotificationsBellComponent } from '../notifications-bell/notifications-bell.component';

const ecuadorDocumentValidator = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) return null;
  return validateEcuadorDocument(value).valid ? null : { documentoInvalido: true };
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, MobileNavComponent, ReactiveFormsModule, NotificationsBellComponent],
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
  whatsappMessage = '';
  whatsappError = '';
  passwordMessage = '';
  passwordError = '';
  isSavingWhatsapp = false;
  isSavingPassword = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  readonly visuals = inject(VisualAssetsService).assets;
  readonly pushNotifications = inject(PushNotificationsService);
  readonly recoveryEmailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    current_password: ['', Validators.required]
  });
  readonly whatsappForm = this.fb.group({
    whatsapp: ['', [Validators.required, Validators.pattern('^(?:\\+?[0-9][0-9 .()-]{7,18})$')]],
    current_password: ['']
  });
  readonly passwordForm = this.fb.group({
    current_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
    confirmation: ['', Validators.required]
  });
  readonly completeDataForm = this.fb.group({
    documento: ['', [ecuadorDocumentValidator]],
    direccion: ['']
  });
  isSavingCompleteData = false;
  completeDataMessage = '';
  completeDataError = '';

  get missingProfileData(): boolean {
    return Boolean(this.profile) && !this.profile.profile_complete;
  }

  get documentError(): string {
    const control = this.completeDataForm.get('documento');
    if (!control?.touched || !control.invalid) return '';
    if (control.hasError('documentoInvalido')) {
      return validateEcuadorDocument(control.value).error || 'La cédula o RUC no es válido.';
    }
    return '';
  }

  saveCompleteData(): void {
    const documento = String(this.completeDataForm.controls.documento.value || '').trim();
    const direccion = String(this.completeDataForm.controls.direccion.value || '').trim();
    const needsDocument = !this.profile?.documento;
    const needsAddress = !this.profile?.direccion;
    if (needsDocument && !documento) {
      this.completeDataError = 'Ingresa tu cédula o RUC.';
      return;
    }
    if (needsAddress && !direccion) {
      this.completeDataError = 'Ingresa tu dirección.';
      return;
    }
    if (this.completeDataForm.invalid) {
      this.completeDataForm.markAllAsTouched();
      return;
    }

    this.isSavingCompleteData = true;
    this.completeDataMessage = '';
    this.completeDataError = '';
    this.authService
      .completeProfileData({
        ...(documento ? { documento } : {}),
        ...(direccion ? { direccion } : {})
      })
      .subscribe({
        next: (response) => {
          this.isSavingCompleteData = false;
          this.profile = {
            ...this.profile,
            documento: response.documento,
            direccion: response.direccion,
            profile_complete: response.profile_complete
          };
          this.completeDataForm.reset({ documento: '', direccion: '' });
          this.completeDataMessage = response.message;
        },
        error: (error) => {
          this.isSavingCompleteData = false;
          this.completeDataError = error.error?.error || 'No se pudieron actualizar tus datos.';
        }
      });
  }

  get profileInitials(): string {
    const names = this.profile?.nombre_completo?.trim().split(/\s+/).filter(Boolean) || [];
    return names.slice(0, 2).map((name: string) => name[0]).join('').toUpperCase() || 'S';
  }

  ngOnInit() {
    this.pushNotifications.initialize();
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.recoveryEmailForm.controls.email.setValue(data.email || '');
        this.whatsappForm.controls.whatsapp.setValue(data.telefono || '');
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
        this.profile = { ...this.profile, pending_email: response.pending_email };
        this.recoveryEmailForm.controls.current_password.reset();
        this.emailSuccessMessage = response.message;
      },
      error: (error) => {
        this.isSavingEmail = false;
        this.emailErrorMessage = error.error?.error || 'No se pudo guardar el correo.';
      }
    });
  }

  saveWhatsapp(): void {
    if (this.whatsappForm.invalid) { this.whatsappForm.markAllAsTouched(); return; }
    this.isSavingWhatsapp = true;
    this.whatsappMessage = '';
    this.whatsappError = '';
    this.authService.updateWhatsapp(this.whatsappForm.controls.whatsapp.value || '', this.whatsappForm.controls.current_password.value || '').subscribe({
      next: (response) => {
        this.isSavingWhatsapp = false;
        this.profile = { ...this.profile, telefono: response.whatsapp };
        this.whatsappForm.controls.whatsapp.setValue(response.whatsapp);
        this.whatsappForm.controls.current_password.reset();
        this.whatsappMessage = response.message;
      },
      error: (error) => { this.isSavingWhatsapp = false; this.whatsappError = error.error?.error || 'No se pudo actualizar el WhatsApp.'; }
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    if (this.passwordForm.controls.new_password.value !== this.passwordForm.controls.confirmation.value) {
      this.passwordError = 'Las contraseñas nuevas no coinciden.';
      return;
    }
    this.isSavingPassword = true;
    this.passwordError = '';
    this.passwordMessage = '';
    this.authService.changePassword(this.passwordForm.controls.current_password.value || '', this.passwordForm.controls.new_password.value || '').subscribe({
      next: (response) => {
        this.isSavingPassword = false;
        this.passwordMessage = response.message;
        this.passwordForm.reset();
        this.authService.logout();
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (error) => { this.isSavingPassword = false; this.passwordError = error.error?.error || 'No se pudo cambiar la contraseña.'; }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
