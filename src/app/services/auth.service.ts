import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/sidro`;
  
  private memoryToken: string | null = null;

  constructor(private http: HttpClient) {}

  login(telefono: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { telefono, password });
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/password/forgot`, { email });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/password/reset`, { token, password });
  }

  updateRecoveryEmail(email: string, currentPassword: string): Observable<{ email: string; message: string }> {
    return this.http.put<{ email: string; message: string }>(`${this.apiUrl}/profile/recovery-email`, {
      email,
      current_password: currentPassword
    });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  setToken(token: string) {
    this.memoryToken = token;
  }

  getToken(): string | null {
    return this.memoryToken;
  }

  isLoggedIn(): boolean {
    return !!this.memoryToken;
  }

  logout() {
    this.memoryToken = null;
  }
}
