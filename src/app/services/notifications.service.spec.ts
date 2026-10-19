import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NotificationsService, SidroNotification } from './notifications.service';

const notification: SidroNotification = {
  id: 5,
  type: 'request_approved',
  title: 'Solicitud aprobada',
  body: 'Tu solicitud fue aprobada.',
  data: { url: '/my-requests?open=7', request_id: 7 },
  read_at: null,
  created_at: new Date().toISOString()
};

describe('NotificationsService (SIDRO)', () => {
  let service: NotificationsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    jasmine.clock().install();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(NotificationsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.stopPolling();
    httpTesting.verify();
    jasmine.clock().uninstall();
  });

  it('actualiza items y contador al consultar', () => {
    service.refresh();

    const request = httpTesting.expectOne((req) => req.url.includes('/sidro/notifications?limit=10'));
    request.flush({ items: [notification], total: 1, unread: 1, limit: 10, offset: 0 });

    expect(service.items().length).toBe(1);
    expect(service.unreadCount()).toBe(1);
  });

  it('hace polling periódico y se detiene al cerrar sesión', () => {
    service.startPolling(30000);
    httpTesting
      .expectOne((req) => req.url.includes('/sidro/notifications?limit=10'))
      .flush({ items: [notification], total: 1, unread: 1, limit: 10, offset: 0 });
    expect(service.isPolling()).toBeTrue();

    jasmine.clock().tick(30000);
    httpTesting
      .expectOne((req) => req.url.includes('/sidro/notifications?limit=10'))
      .flush({ items: [notification], total: 1, unread: 1, limit: 10, offset: 0 });

    service.stopPolling();
    expect(service.isPolling()).toBeFalse();
    jasmine.clock().tick(90000);
    httpTesting.expectNone((req) => req.url.includes('/sidro/notifications?limit=10'));
    expect(service.items().length).toBe(0);
    expect(service.unreadCount()).toBe(0);
  });

  it('marca como leída solo la notificación indicada', () => {
    service.items.set([notification]);
    service.unreadCount.set(1);

    service.markAsRead(notification);
    const request = httpTesting.expectOne((req) => req.url.endsWith('/sidro/notifications/5/read'));
    expect(request.request.method).toBe('POST');
    request.flush({ id: 5, read_at: new Date().toISOString(), changed: true });

    expect(service.items()[0].read_at).not.toBeNull();
    expect(service.unreadCount()).toBe(0);

    service.markAsRead(service.items()[0]);
    httpTesting.expectNone((req) => req.url.endsWith('/sidro/notifications/5/read'));
  });
});
