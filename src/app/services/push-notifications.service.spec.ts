import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SwPush } from '@angular/service-worker';
import { Observable, of } from 'rxjs';

import { PushNotificationsService } from './push-notifications.service';

describe('PushNotificationsService (SIDRO)', () => {
  let service: PushNotificationsService;
  let httpTesting: HttpTestingController;
  let permission: 'default' | 'denied' | 'granted';
  let requestSubscription: jasmine.Spy;
  let subscriptionSubject: Observable<PushSubscription | null>;
  const unsubscribe = jasmine.createSpy('unsubscribe').and.resolveTo(true);
  const pushSubscription = {
    endpoint: 'https://push.example.invalid/one',
    toJSON: () => ({ endpoint: 'https://push.example.invalid/one', keys: { p256dh: 'A'.repeat(64), auth: 'B'.repeat(24) } }),
    unsubscribe
  };

  const setup = (isEnabled = true) => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SwPush, useValue: { isEnabled, subscription: subscriptionSubject, requestSubscription } }
      ]
    });
    service = TestBed.inject(PushNotificationsService);
    httpTesting = TestBed.inject(HttpTestingController);
  };

  const flushConfig = (enabled = true, publicKey: string | null = 'clave-publica') => {
    const request = httpTesting.expectOne((req) => req.url.endsWith('/sidro/notifications/push/config'));
    request.flush({ enabled, publicKey });
  };

  beforeEach(() => {
    permission = 'default';
    Object.defineProperty(Notification, 'permission', { configurable: true, get: () => permission });
    requestSubscription = jasmine.createSpy('requestSubscription').and.resolveTo(pushSubscription);
    subscriptionSubject = of(null);
    unsubscribe.calls.reset();
  });

  afterEach(() => {
    delete (Notification as unknown as { permission?: string }).permission;
    httpTesting.verify();
  });

  it('queda no disponible cuando el servidor no habilita Push', () => {
    setup();
    service.initialize();
    flushConfig(false, null);

    expect(service.state()).toBe('unavailable');
    expect(requestSubscription).not.toHaveBeenCalled();
  });

  it('marca prompt sin pedir permiso al inicializar', () => {
    setup();
    service.initialize();
    flushConfig();

    expect(service.state()).toBe('prompt');
    expect(requestSubscription).not.toHaveBeenCalled();
    httpTesting.expectNone((req) => req.method === 'POST');
  });

  it('registra la suscripción existente sin pedir permiso', () => {
    subscriptionSubject = of(pushSubscription as unknown as PushSubscription);
    setup();
    service.initialize();
    flushConfig();

    const request = httpTesting.expectOne((req) => req.url.endsWith('/sidro/notifications/subscriptions'));
    expect(request.request.method).toBe('POST');
    request.flush({ changed: true });

    expect(service.state()).toBe('enabled');
    expect(requestSubscription).not.toHaveBeenCalled();
  });

  it('informa permiso denegado sin pedir suscripción', () => {
    permission = 'denied';
    setup();
    service.initialize();
    flushConfig();

    expect(service.state()).toBe('denied');
    expect(requestSubscription).not.toHaveBeenCalled();
  });

  it('queda sin soporte cuando el service worker está inactivo', () => {
    setup(false);
    service.initialize();
    flushConfig();

    expect(service.state()).toBe('unsupported');
    expect(service.message()).toContain('Push');
  });

  it('enable pide el permiso una vez, registra el endpoint y activa el estado', async () => {
    setup();
    service.initialize();
    flushConfig();

    await service.enable();

    expect(requestSubscription).toHaveBeenCalledOnceWith({ serverPublicKey: 'clave-publica' });
    const request = httpTesting.expectOne((req) => req.url.endsWith('/sidro/notifications/subscriptions'));
    request.flush({ changed: true });

    expect(service.state()).toBe('enabled');
    expect(service.busy()).toBeFalse();
    expect(service.message()).toContain('avisos');
  });

  it('en iPhone sin instalar no pide permiso y guía la instalación', async () => {
    setup();
    service.initialize();
    flushConfig();
    Object.defineProperty(service, 'isIos', { value: true });
    Object.defineProperty(service, 'isStandalone', { value: false });

    await service.enable();

    expect(requestSubscription).not.toHaveBeenCalled();
    expect(service.message()).toContain('pantalla de inicio');
    expect(service.state()).toBe('prompt');
  });

  it('un fallo al registrar deja el estado en error', () => {
    subscriptionSubject = of(pushSubscription as unknown as PushSubscription);
    setup();
    service.initialize();
    flushConfig();

    const request = httpTesting.expectOne((req) => req.url.endsWith('/sidro/notifications/subscriptions'));
    request.flush({ error: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(service.state()).toBe('error');
    expect(service.message()).toContain('cuenta SIDRO');
  });

  it('disable revoca el endpoint, desuscribe el navegador y vuelve a prompt', async () => {
    subscriptionSubject = of(pushSubscription as unknown as PushSubscription);
    setup();

    service.disable();

    const request = httpTesting.expectOne((req) => req.url.endsWith('/sidro/notifications/subscriptions'));
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual({ endpoint: 'https://push.example.invalid/one' });
    request.flush({ changed: true });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(unsubscribe).toHaveBeenCalled();
    expect(service.state()).toBe('prompt');
    expect(service.message()).toContain('desactivadas');
  });

  it('disable sin suscripción no llama al backend', () => {
    subscriptionSubject = of(null);
    setup();

    service.disable();

    httpTesting.expectNone((req) => req.url.endsWith('/sidro/notifications/subscriptions'));
    expect(service.state()).toBe('prompt');
  });
});
