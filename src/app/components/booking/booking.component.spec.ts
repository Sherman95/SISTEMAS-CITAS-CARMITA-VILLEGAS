import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { BookingComponent } from './booking.component';
import { BookingService } from '../../services/booking.service';

describe('BookingComponent', () => {
  let component: BookingComponent;
  let fixture: ComponentFixture<BookingComponent>;
  let bookingService: jasmine.SpyObj<BookingService>;

  beforeEach(async () => {
    bookingService = jasmine.createSpyObj<BookingService>('BookingService', [
      'getServices',
      'getProfessionals',
      'getProfessionalsForServices',
      'getAvailability',
      'createRequest'
    ]);
    bookingService.getServices.and.returnValue(of([]));
    bookingService.getProfessionals.and.returnValue(of([]));
    bookingService.getProfessionalsForServices.and.returnValue(of([]));
    bookingService.getAvailability.and.returnValue(of([]));
    bookingService.createRequest.and.returnValue(of({
      service_id: 'service-uuid',
      employee_id: 'employee-uuid',
      request_date: '2026-10-16',
      start_time: '10:00:00',
      client_notes: 'Quiero un acabado natural.'
    }));

    await TestBed.configureTestingModule({
      imports: [BookingComponent],
      providers: [
        { provide: BookingService, useValue: bookingService },
        provideRouter([])
      ]
    }).compileComponents();

    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(BookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads services through BookingService', () => {
    expect(bookingService.getServices).toHaveBeenCalled();
    expect(component.services).toEqual([]);
  });

  it('prevents submission until all booking fields are selected', () => {
    component.submitRequest();

    expect(bookingService.createRequest).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('Completa');
  });

  it('requires an explanatory note before submitting a complete request', () => {
    component.selectedService = {
      id: 'service-uuid',
      nombre: 'Servicio',
      precio: 20,
      duration_minutes: 60,
      padding_minutes: 0
    };
    component.selectedProfessional = { employee_id: 'employee-uuid', nombre: 'Profesional' };
    component.selectedDate = '2026-10-16';
    component.selectedSlot = '10:00';
    component.clientNotes = 'Corto';

    component.submitRequest();

    expect(bookingService.createRequest).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('al menos 10 caracteres');
  });

  it('allows selecting more than one service and sends all service ids', () => {
    const first = {
      id: 'service-1', nombre: 'Corte', precio: 15,
      duration_minutes: 30, padding_minutes: 0
    };
    const second = {
      id: 'service-2', nombre: 'Manicure', precio: 20,
      duration_minutes: 60, padding_minutes: 0
    };
    component.selectService(first);
    component.selectService(second);
    component.selectedProfessional = { employee_id: 'employee-uuid', nombre: 'Profesional' };
    component.selectedDate = '2026-10-16';
    component.selectedSlot = '10:00';
    component.clientNotes = 'Quiero ambos servicios con acabado natural.';

    component.submitRequest();

    expect(component.selectedServices.length).toBe(2);
    expect(component.selectedServicesTotal).toBe(35);
    expect(bookingService.createRequest).toHaveBeenCalledWith(jasmine.objectContaining({
      service_id: 'service-1',
      service_ids: ['service-1', 'service-2']
    }));
  });

  it('sends normalized client notes with the booking request', () => {
    component.selectedService = {
      id: 'service-uuid',
      nombre: 'Servicio',
      precio: 20,
      duration_minutes: 60,
      padding_minutes: 0
    };
    component.selectedProfessional = { employee_id: 'employee-uuid', nombre: 'Profesional' };
    component.selectedDate = '2026-10-16';
    component.selectedSlot = '10:00';
    component.clientNotes = '  Quiero un acabado natural.  ';

    component.submitRequest();

    expect(bookingService.createRequest).toHaveBeenCalledWith(jasmine.objectContaining({
      client_notes: 'Quiero un acabado natural.'
    }));
  });
});
