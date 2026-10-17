import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BookingService } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookingService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(BookingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses the SIDRO API prefix and request_date for availability', () => {
    service.getAvailability('service-uuid', 'employee-uuid', '2026-10-16').subscribe();

    const request = http.expectOne(
      (req) => req.url.endsWith('/api/sidro/availability')
    );
    expect(request.request.params.get('service_ids')).toBe('service-uuid');
    expect(request.request.params.get('employee_id')).toBe('employee-uuid');
    expect(request.request.params.get('request_date')).toBe('2026-10-16');
    request.flush([]);
  });

  it('requests professionals compatible with every selected service', () => {
    service.getProfessionalsForServices(['service-1', 'service-2']).subscribe();

    const request = http.expectOne(
      (req) => req.url.endsWith('/api/sidro/public/professionals')
    );
    expect(request.request.params.get('service_ids')).toBe('service-1,service-2');
    request.flush([]);
  });

  it('posts the real proposal action endpoints', () => {
    service.acceptProposal(42).subscribe();
    const accept = http.expectOne(
      'http://localhost:3000/api/sidro/requests/42/accept-proposal'
    );
    expect(accept.request.method).toBe('POST');
    accept.flush({ message: 'ok' });

    service.rejectProposal(43).subscribe();
    const reject = http.expectOne(
      'http://localhost:3000/api/sidro/requests/43/reject-proposal'
    );
    expect(reject.request.method).toBe('POST');
    reject.flush({ message: 'ok' });
  });
});
