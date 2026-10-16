import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookingService, SidroProfessional, SidroService } from '../../services/booking.service';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MobileNavComponent],
  templateUrl: './booking.view.html',
  styleUrl: './booking.view.scss'
})
export class BookingComponent implements OnInit {
  step = 1;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  services: SidroService[] = [];
  professionals: SidroProfessional[] = [];
  availableSlots: string[] = [];

  selectedService: SidroService | null = null;
  selectedProfessional: SidroProfessional | null = null;
  selectedDate: string = '';
  selectedSlot: string = '';
  clientNotes: string = '';
  minDate = '';
  readonly minimumNotesLength = 10;
  readonly maximumNotesLength = 500;

  private bookingService = inject(BookingService);
  private router = inject(Router);

  ngOnInit() {
    const today = new Date();
    this.minDate = this.toLocalDateValue(today);
    this.loadServices();
  }

  loadServices() {
    this.isLoading = true;
    this.errorMessage = '';
    // Debemos llamar un endpoint publico de servicios (o autenticado si estamos en PWA)
    this.bookingService.getServices().subscribe({
      next: (data) => {
        this.services = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los servicios.';
        this.isLoading = false;
      }
    });
  }

  selectService(s: SidroService) {
    if (this.selectedService?.id !== s.id) {
      this.selectedProfessional = null;
      this.selectedDate = '';
      this.selectedSlot = '';
      this.availableSlots = [];
    }
    this.selectedService = s;
    this.errorMessage = '';
  }

  continueToProfessionals() {
    if (!this.selectedService) return;
    this.step = 2;
    this.loadProfessionals();
  }

  loadProfessionals() {
    if (!this.selectedService) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.selectedProfessional = null;
    this.bookingService.getProfessionals(this.selectedService.id).subscribe({
      next: (data) => {
        this.professionals = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los profesionales.';
        this.isLoading = false;
      }
    });
  }

  selectProfessional(p: SidroProfessional) {
    if (this.selectedProfessional?.employee_id !== p.employee_id) {
      this.selectedDate = '';
      this.selectedSlot = '';
      this.availableSlots = [];
    }
    this.selectedProfessional = p;
    this.errorMessage = '';
  }

  loadAvailability() {
    if (!this.selectedDate || !this.selectedProfessional || !this.selectedService) return;
    this.isLoading = true;
    this.selectedSlot = '';
    this.errorMessage = '';
    
    // API endpoint que devuelve los turnos disponibles `['09:00', '10:00']`
    this.bookingService.getAvailability(
      this.selectedService.id,
      this.selectedProfessional.employee_id,
      this.selectedDate
    ).subscribe({
       next: (slots) => {
           this.availableSlots = slots;
           this.isLoading = false;
       },
       error: () => {
           this.errorMessage = 'No se pudo consultar la disponibilidad.';
           this.isLoading = false;
       }
    });
  }

  submitRequest() {
    if (this.isSubmitting) return;
    if (!this.selectedService || !this.selectedProfessional || !this.selectedDate || !this.selectedSlot) {
      this.errorMessage = 'Completa el servicio, profesional, fecha y horario.';
      return;
    }
    const normalizedNotes = this.clientNotes.trim();
    if (normalizedNotes.length < this.minimumNotesLength) {
      this.errorMessage = `Cuéntanos qué quieres hacerte en al menos ${this.minimumNotesLength} caracteres.`;
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    
    // Auth Token es auto inyectado por el interceptor
    this.bookingService.createRequest({
       service_id: this.selectedService.id,
       employee_id: this.selectedProfessional.employee_id,
       request_date: this.selectedDate,
       start_time: this.selectedSlot,
       client_notes: normalizedNotes
    }).subscribe({
       next: () => {
           this.isSubmitting = false;
           this.router.navigate(['/my-requests']);
       },
       error: (err) => {
           this.isSubmitting = false;
           this.errorMessage = err.error?.error || 'Error al procesar la solicitud.';
       }
    });
  }

  formatDuration(minutes: number | null): string {
    return minutes ? `${minutes} min aprox.` : 'Duración por confirmar';
  }

  professionalInitials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  formatTime(value: string): string {
    return value?.slice(0, 5) || '--:--';
  }

  formatSelectedDate(): string {
    if (!this.selectedDate) return 'Por elegir';
    const [year, month, day] = this.selectedDate.split('-').map(Number);
    return new Intl.DateTimeFormat('es-EC', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(year, month - 1, day));
  }

  get notesCharactersRemaining(): number {
    return this.maximumNotesLength - this.clientNotes.length;
  }

  private toLocalDateValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
