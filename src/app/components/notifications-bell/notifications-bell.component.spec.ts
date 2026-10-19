import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { NotificationsBellComponent } from './notifications-bell.component';
import { NotificationsService, SidroNotification } from '../../services/notifications.service';
import { AuthService } from '../../services/auth.service';

const makeNotification = (overrides: Partial<SidroNotification> = {}): SidroNotification => ({
  id: 1,
  type: 'sidro_request_confirmed',
  title: 'Tu cita fue confirmada',
  body: 'Consulta los detalles en SIDRO.',
  data: { url: '/my-requests?open=1' },
  read_at: null,
  created_at: '2026-10-18T15:00:00.000Z',
  ...overrides
});

describe('NotificationsBellComponent (SIDRO)', () => {
  let fixture: ComponentFixture<NotificationsBellComponent>;
  let component: NotificationsBellComponent;
  let httpTesting: HttpTestingController;
  let service: NotificationsService;
  let router: Router;
  const authStub = { token: null as string | null, getToken() { return this.token; } };

  const createComponent = () => {
    fixture = TestBed.createComponent(NotificationsBellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return fixture;
  };

  const flushRefresh = (limit: number, items: SidroNotification[] = [], unread = items.filter((item) => !item.read_at).length) => {
    const request = httpTesting.expectOne((req) => req.url.endsWith(`/sidro/notifications?limit=${limit}`));
    request.flush({ items, total: items.length, unread, limit, offset: 0 });
  };

  beforeEach(async () => {
    authStub.token = null;
    await TestBed.configureTestingModule({
      imports: [NotificationsBellComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authStub }
      ]
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(NotificationsService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    fixture?.destroy();
    httpTesting.verify();
  });

  it('no inicia polling si no hay sesión', () => {
    createComponent();

    expect(service.isPolling()).toBeFalse();
    httpTesting.expectNone((req) => req.url.includes('/sidro/notifications'));
  });

  it('inicia polling una sola vez con sesión activa', () => {
    authStub.token = 'token-sidro';
    createComponent();

    expect(service.isPolling()).toBeTrue();
    flushRefresh(10, [makeNotification()]);

    service.startPolling();
    expect(service.isPolling()).toBeTrue();
    httpTesting.expectNone((req) => req.url.includes('/sidro/notifications?limit=50'));
  });

  it('oculta el badge sin pendientes y lo muestra con contador', () => {
    createComponent();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.bell-badge')).toBeNull();

    service.unreadCount.set(3);
    fixture.detectChanges();
    expect(element.querySelector('.bell-badge')?.textContent?.trim()).toBe('3');
  });

  it('limita el badge a 99+', () => {
    createComponent();
    service.unreadCount.set(150);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.bell-badge')?.textContent?.trim()).toBe('99+');
    expect(component.unreadLabel).toBe('99+');
  });

  it('abre el panel, consulta con límite ampliado y marca aria-expanded', () => {
    createComponent();
    const button = fixture.nativeElement.querySelector('.bell-button') as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(component.panelOpen()).toBeTrue();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    flushRefresh(50, [makeNotification()]);
    expect(service.items().length).toBe(1);
  });

  it('muestra los estados vacío, carga y error con reintento', () => {
    createComponent();
    component.togglePanel();
    fixture.detectChanges();
    flushRefresh(50, []);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Todo está al día.');

    service.hasLoaded.set(false);
    service.loading.set(true);
    fixture.detectChanges();
    expect(element.querySelector('.bell-skeleton')).not.toBeNull();

    service.loading.set(false);
    service.lastError.set('No se pudieron actualizar las notificaciones.');
    fixture.detectChanges();
    expect(element.querySelector('.bell-state-error')).not.toBeNull();

    component.retry();
    flushRefresh(50, []);
    fixture.detectChanges();
    expect(service.lastError()).toBe('');
  });

  it('filtra sin leer sin alterar el contador global', () => {
    service.items.set([
      makeNotification({ id: 1 }),
      makeNotification({ id: 2, read_at: '2026-10-18T16:00:00.000Z' })
    ]);
    service.unreadCount.set(1);
    service.hasLoaded.set(true);
    createComponent();

    expect(component.visibleItems.length).toBe(2);
    component.setFilter('unread');
    expect(component.visibleItems.map((item) => item.id)).toEqual([1]);
    component.setFilter('all');
    expect(component.visibleItems.length).toBe(2);
  });

  it('al abrir el panel no marca todo como leído', () => {
    service.items.set([makeNotification({ id: 3 }), makeNotification({ id: 4 })]);
    service.unreadCount.set(2);
    service.hasLoaded.set(true);
    createComponent();

    component.togglePanel();
    fixture.detectChanges();
    flushRefresh(50, service.items());

    httpTesting.expectNone((req) => req.url.includes('/read'));
  });

  it('marca leída la notificación abierta y navega a su deep-link', () => {
    service.items.set([makeNotification({ id: 7 })]);
    service.unreadCount.set(1);
    service.hasLoaded.set(true);
    createComponent();
    const navigate = spyOn(router, 'navigateByUrl');

    component.openNotification(service.items()[0]);

    const request = httpTesting.expectOne((req) => req.url.endsWith('/sidro/notifications/7/read'));
    expect(request.request.method).toBe('POST');
    request.flush({ id: 7, read_at: '2026-10-18T17:00:00.000Z', changed: true });

    expect(navigate).toHaveBeenCalledWith('/my-requests?open=1');
    expect(component.panelOpen()).toBeFalse();
    expect(service.unreadCount()).toBe(0);
  });

  it('no reenvía la marca de lectura ni navega sin URL para notificaciones leídas', () => {
    service.items.set([makeNotification({ id: 8, read_at: '2026-10-18T16:00:00.000Z', data: {} })]);
    service.hasLoaded.set(true);
    createComponent();
    const navigate = spyOn(router, 'navigateByUrl');

    component.openNotification(service.items()[0]);

    httpTesting.expectNone((req) => req.url.includes('/read'));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('rechaza URLs externas al abrir una notificación', () => {
    service.items.set([makeNotification({ id: 9, data: { url: 'https://evil.example/steal' } })]);
    service.unreadCount.set(1);
    service.hasLoaded.set(true);
    createComponent();
    const navigate = spyOn(router, 'navigateByUrl');

    component.openNotification(service.items()[0]);
    httpTesting.expectOne((req) => req.url.endsWith('/sidro/notifications/9/read')).flush({ id: 9, read_at: 'x', changed: true });

    expect(navigate).not.toHaveBeenCalled();
  });

  it('cierra el panel con Escape y con clic fuera', () => {
    service.hasLoaded.set(true);
    createComponent();

    component.togglePanel();
    fixture.detectChanges();
    flushRefresh(50);
    expect(component.panelOpen()).toBeTrue();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.panelOpen()).toBeFalse();

    component.togglePanel();
    fixture.detectChanges();
    flushRefresh(50);
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.panelOpen()).toBeFalse();
  });

  it('detiene el polling y limpia el estado al destruirse', () => {
    authStub.token = 'token-sidro';
    createComponent();
    flushRefresh(10, [makeNotification()]);
    expect(service.items().length).toBe(1);

    fixture.destroy();

    expect(service.isPolling()).toBeFalse();
    expect(service.items().length).toBe(0);
    expect(service.unreadCount()).toBe(0);
    httpTesting.verify();
  });

  it('asigna un icono por tipo de evento', () => {
    createComponent();

    expect(component.iconFor('sidro_request_created')).toBe('created');
    expect(component.iconFor('sidro_request_confirmed')).toBe('confirmed');
    expect(component.iconFor('sidro_proposal_accepted')).toBe('confirmed');
    expect(component.iconFor('sidro_request_proposal')).toBe('proposal');
    expect(component.iconFor('sidro_request_rejected')).toBe('declined');
    expect(component.iconFor('sidro_appointment_cancelled')).toBe('declined');
    expect(component.iconFor('evento_desconocido')).toBe('info');
  });
});
