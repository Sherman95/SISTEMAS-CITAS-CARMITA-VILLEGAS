import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MyRequestsComponent } from './my-requests.component';
import { BookingService, SidroRequest } from '../../services/booking.service';

describe('MyRequestsComponent', () => {
  let component: MyRequestsComponent;
  let fixture: ComponentFixture<MyRequestsComponent>;
  let bookingService: jasmine.SpyObj<BookingService>;
  const proposal: SidroRequest = {
    id: 7,
    service_id: 'service-uuid',
    employee_id: 'employee-uuid',
    request_date: '2026-10-16',
    start_time: '10:00:00',
    service_name: 'Servicio',
    employee_name: 'Profesional',
    status: 'PROPUESTA',
    proposed_date: '2026-10-17',
    proposed_start_time: '11:00:00',
    proposed_end_time: '12:00:00'
  };

  beforeEach(async () => {
    bookingService = jasmine.createSpyObj<BookingService>('BookingService', [
      'getMyRequests',
      'acceptProposal',
      'rejectProposal'
    ]);
    bookingService.getMyRequests.and.returnValue(of([proposal]));
    bookingService.acceptProposal.and.returnValue(of({ message: 'ok' }));
    bookingService.rejectProposal.and.returnValue(of({ message: 'ok' }));

    await TestBed.configureTestingModule({
      imports: [MyRequestsComponent],
      providers: [{ provide: BookingService, useValue: bookingService }, provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MyRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows proposal data and status', () => {
    expect(component.requests[0].status).toBe('PROPUESTA');
    expect(component.formatStatus('PROPUESTA')).toBe('Propuesta');
  });

  it('accepts a proposal through BookingService', () => {
    component.acceptProposal(proposal);

    expect(bookingService.acceptProposal).toHaveBeenCalledWith(7);
    expect(bookingService.getMyRequests).toHaveBeenCalledTimes(2);
  });

  it('rejects a proposal through BookingService', () => {
    component.rejectProposal(proposal);

    expect(bookingService.rejectProposal).toHaveBeenCalledWith(7);
    expect(bookingService.getMyRequests).toHaveBeenCalledTimes(2);
  });
});
