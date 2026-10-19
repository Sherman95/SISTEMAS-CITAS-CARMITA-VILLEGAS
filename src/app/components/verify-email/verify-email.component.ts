import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `<main class="verify-page"><section class="verify-card"><span class="eyebrow">Seguridad SIDRO</span><h1>Confirmación de correo</h1><p *ngIf="isLoading">Estamos verificando tu enlace…</p><p *ngIf="message" class="success" role="status">{{ message }}</p><p *ngIf="error" class="error" role="alert">{{ error }}</p><a routerLink="/login">Ir a iniciar sesión</a></section></main>`,
  styles: [`:host{display:block;min-height:100vh;background:#fbf6f2}.verify-page{min-height:100vh;display:grid;place-items:center;padding:1.5rem}.verify-card{max-width:34rem;background:#fff;border:1px solid #eadbd6;border-radius:26px;box-shadow:0 18px 50px rgba(74,28,49,.1);padding:2rem;text-align:center}.eyebrow{color:#9b4562;font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}h1{color:#4a1c2f;font-family:Georgia,serif;font-size:clamp(2rem,8vw,3.2rem);margin:.6rem 0 1rem}.success{color:#24633d}.error{color:#9b2335}a{display:inline-block;margin-top:1rem;background:#7a1839;color:#fff;border-radius:999px;padding:.85rem 1.25rem;text-decoration:none;font-weight:700}`]
})
export class VerifyEmailComponent {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  isLoading = true;
  message = '';
  error = '';

  constructor() {
    const token = (this.route.snapshot.queryParamMap.get('token') || '').trim().toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(token)) {
      this.isLoading = false;
      this.error = 'El enlace de verificación no es válido.';
      return;
    }
    this.auth.verifyEmail(token).subscribe({
      next: ({ message }) => { this.isLoading = false; this.message = message; this.auth.logout(); },
      error: (error) => { this.isLoading = false; this.error = error.error?.error || 'No pudimos verificar el correo.'; }
    });
  }
}
