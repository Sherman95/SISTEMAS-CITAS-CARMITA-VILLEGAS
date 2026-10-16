import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MobileNavComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  profile: any = null;
  isLoading = true;
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  get firstName(): string {
    return this.profile?.nombre_completo?.trim().split(/\s+/)[0] || 'bienvenida';
  }

  get profileInitials(): string {
    const names = this.profile?.nombre_completo?.trim().split(/\s+/).filter(Boolean) || [];
    return names.slice(0, 2).map((name: string) => name[0]).join('').toUpperCase() || 'S';
  }

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'No se pudo cargar la información.';
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
           this.authService.logout();
           this.router.navigate(['/login']);
        }
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
