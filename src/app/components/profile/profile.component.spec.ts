import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { ProfileComponent } from './profile.component';
import { PushNotificationsService } from '../../services/push-notifications.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let httpTesting: HttpTestingController;
  const pushNotificationsMock = {
    state: signal<'prompt'>('prompt'),
    busy: signal(false),
    message: signal(''),
    isIos: false,
    isStandalone: false,
    initialize: jasmine.createSpy('initialize'),
    enable: jasmine.createSpy('enable'),
    disable: jasmine.createSpy('disable')
  };

  const baseProfile = {
    id: 'account-1',
    nombre_completo: 'Ana Torres',
    telefono: '+593991234567',
    email: 'ana@example.com',
    linked: false,
    legacy_account: false,
    documento: null,
    direccion: null,
    profile_complete: false
  };

  const flushProfile = (profile: Record<string, unknown> = {}) => {
    const request = httpTesting.expectOne((req) => req.url.endsWith('/api/sidro/profile'));
    request.flush({ ...baseProfile, ...profile });
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: PushNotificationsService, useValue: pushNotificationsMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpTesting.verify());

  it('should create', () => {
    flushProfile();
    expect(component).toBeTruthy();
  });

  it('muestra el aviso de completar datos para cuentas antiguas', () => {
    flushProfile();
    fixture.detectChanges();

    expect(component.missingProfileData).toBe(true);
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Completa tus datos');
    expect(element.textContent).toContain(
      'Completa tus datos para facilitar tus próximas reservas y la atención en el salón.'
    );
  });

  it('oculta el aviso cuando el perfil ya está completo', () => {
    flushProfile({ documento: '1710034065', direccion: 'Av. Amazonas 123', profile_complete: true });
    fixture.detectChanges();

    expect(component.missingProfileData).toBe(false);
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).not.toContain('Completa tus datos para facilitar');
    expect(element.textContent).toContain('1710034065');
  });

  it('rechaza un documento inválido antes de llamar al backend', () => {
    flushProfile();
    component.completeDataForm.patchValue({ documento: '1234567890', direccion: 'Av. Amazonas 123' });

    component.saveCompleteData();

    expect(component.completeDataForm.get('documento')?.hasError('documentoInvalido')).toBe(true);
    expect(component.completeDataForm.get('documento')?.touched).toBe(true);
    httpTesting.expectNone((req) => req.url.includes('/profile/complete-data'));
  });

  it('guarda documento y dirección y actualiza el estado del perfil', () => {
    flushProfile();
    component.completeDataForm.patchValue({
      documento: '1710034065',
      direccion: 'Av. Amazonas 123 y Patria'
    });

    component.saveCompleteData();

    const request = httpTesting.expectOne((req) =>
      req.url.endsWith('/api/sidro/profile/complete-data')
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      documento: '1710034065',
      direccion: 'Av. Amazonas 123 y Patria'
    });
    request.flush({
      message: 'Tus datos se actualizaron correctamente.',
      documento: '1710034065',
      direccion: 'Av. Amazonas 123 y Patria',
      profile_complete: true
    });

    expect(component.profile.documento).toBe('1710034065');
    expect(component.profile.profile_complete).toBe(true);
    expect(component.completeDataMessage).toContain('Tus datos se actualizaron');
    expect(component.missingProfileData).toBe(false);
  });
});
