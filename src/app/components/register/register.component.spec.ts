import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpTesting: HttpTestingController;

  const validPayload = {
    nombre_completo: 'Ana Torres',
    documento: '1710034065',
    telefono: '+593 99 123 4567',
    email: 'ana@example.com',
    direccion: 'Av. Amazonas 123 y Patria',
    password: 'Secreto123!',
    password_confirm: 'Secreto123!',
    privacy_accepted: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpTesting.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rechaza una cédula con dígito verificador inválido', () => {
    component.registerForm.patchValue({ ...validPayload, documento: '1234567890' });
    expect(component.registerForm.get('documento')?.invalid).toBe(true);
    expect(component.registerForm.errors?.['documentoInvalido']).toBeUndefined();
    expect(component.registerForm.get('documento')?.hasError('documentoInvalido')).toBe(true);
  });

  it('acepta cédulas de distintos códigos provinciales y RUC de 13 dígitos', () => {
    for (const documento of ['0122345671', '0934567892', '2451234567', '3012345652', '1710034065001', '1790012344001']) {
      component.registerForm.patchValue({ ...validPayload, documento });
      expect(component.registerForm.get('documento')?.hasError('documentoInvalido'))
        .withContext(documento)
        .toBe(false);
    }
  });

  it('exige confirmar la contraseña y aceptar el uso de datos', () => {
    component.registerForm.patchValue({ ...validPayload, password_confirm: 'OtraClave123', privacy_accepted: false });
    expect(component.registerForm.hasError('passwordsMismatch')).toBe(true);
    expect(component.registerForm.invalid).toBe(true);

    component.registerForm.patchValue({ password_confirm: validPayload.password, privacy_accepted: false });
    expect(component.registerForm.get('privacy_accepted')?.hasError('required')).toBe(true);
    expect(component.registerForm.get('privacy_accepted')?.errors?.['requiredTrue']).toBeUndefined();
  });

  it('envía todos los campos del registro y exige verificar el correo antes de ingresar', () => {
    component.registerForm.patchValue(validPayload);

    component.onSubmit();

    const request = httpTesting.expectOne((req) => req.url.endsWith('/api/sidro/register'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(validPayload);
    request.flush({ message: 'Cuenta creada. Revisa tu correo para verificar tu cuenta antes de iniciar sesión.' });
    expect(component.successMessage).toContain('Revisa tu correo');
    expect(component.registerForm.disabled).toBe(true);
    expect(component.isLoading).toBe(false);
  });

  it('muestra el mensaje genérico cuando los datos ya están asociados', () => {
    component.registerForm.patchValue(validPayload);
    component.onSubmit();

    const request = httpTesting.expectOne((req) => req.url.endsWith('/api/sidro/register'));
    request.flush(
      { error: 'Esos datos ya están asociados a una cuenta SIDRO. Inicia sesión o recupera tu contraseña.' },
      { status: 409, statusText: 'Conflict' }
    );

    expect(component.errorMessage).toContain('Esos datos ya están asociados a una cuenta SIDRO');
    expect(component.isLoading).toBe(false);
  });
});
