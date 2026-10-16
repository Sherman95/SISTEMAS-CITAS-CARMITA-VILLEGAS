import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let authReq = req;
  // Solo enviar a nuestro backend autorizado
  const isTargetApi = req.url.startsWith(environment.apiUrl);
  if (token && isTargetApi && !req.url.includes('/login') && !req.url.includes('/register')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 significa no autenticado o expirado, ahí sí cerramos sesión.
      // 403 significa prohibido (ej. no admin), no necesariamente hay que desloguear.
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
