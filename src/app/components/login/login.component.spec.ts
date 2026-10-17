import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpTesting.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('uses email and password as login credentials', () => {
    component.loginForm.setValue({ email: 'CLIENTA@EXAMPLE.COM ', password: 'secret123' });

    component.onSubmit();

    const request = httpTesting.expectOne((req) => req.url.endsWith('/api/sidro/login'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'clienta@example.com', password: 'secret123' });
    request.flush({ token: 'test-token' });
  });

  it('offers password recovery after invalid credentials', () => {
    component.loginForm.setValue({ email: 'clienta@example.com', password: 'incorrecta' });

    component.onSubmit();

    const request = httpTesting.expectOne((req) => req.url.endsWith('/api/sidro/login'));
    request.flush({ error: 'Correo o contraseña incorrectos' }, { status: 401, statusText: 'Unauthorized' });

    expect(component.showRecoveryPrompt).toBeTrue();
    expect(component.errorMessage).toContain('correo o la contraseña');
  });
});
