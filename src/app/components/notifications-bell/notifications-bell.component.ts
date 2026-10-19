import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationsService, SidroNotification } from '../../services/notifications.service';

type NotificationFilter = 'all' | 'unread';

const PANEL_LIMIT = 50;

@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-bell.component.html',
  styleUrl: './notifications-bell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsBellComponent implements OnInit, OnDestroy {
  readonly panelOpen = signal(false);
  readonly filter = signal<NotificationFilter>('all');

  private readonly notifications = inject(NotificationsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  @ViewChild('bellButton') private bellButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('panel') private panel?: ElementRef<HTMLElement>;

  readonly items = this.notifications.items;
  readonly unreadCount = this.notifications.unreadCount;
  readonly lastError = this.notifications.lastError;
  readonly loading = this.notifications.loading;

  ngOnInit(): void {
    if (this.auth.getToken()) {
      this.notifications.startPolling();
    }
  }

  ngOnDestroy(): void {
    this.notifications.stopPolling();
  }

  get visibleItems(): SidroNotification[] {
    const list = this.items();
    return this.filter() === 'unread' ? list.filter((item) => !item.read_at) : list;
  }

  get unreadLabel(): string {
    const count = this.unreadCount();
    return count > 99 ? '99+' : String(count);
  }

  togglePanel(): void {
    if (this.panelOpen()) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel(): void {
    this.panelOpen.set(true);
    this.notifications.refresh(PANEL_LIMIT);
    setTimeout(() => this.panel?.nativeElement.focus(), 0);
  }

  closePanel(): void {
    if (!this.panelOpen()) return;
    this.panelOpen.set(false);
    this.bellButton?.nativeElement.focus();
  }

  setFilter(filter: NotificationFilter): void {
    this.filter.set(filter);
  }

  retry(): void {
    this.notifications.refresh(PANEL_LIMIT);
  }

  iconFor(type: string): string {
    const value = String(type || '').toLowerCase();
    if (value.includes('confirmed') || value.includes('accepted')) return 'confirmed';
    if (value.includes('rejected') || value.includes('cancelled') || value.includes('declined')) return 'declined';
    if (value.includes('created')) return 'created';
    if (value.includes('proposal')) return 'proposal';
    return 'info';
  }

  formatWhen(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('es-EC', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  trackById(index: number, notification: SidroNotification): number {
    return notification.id;
  }

  openNotification(notification: SidroNotification): void {
    this.notifications.markAsRead(notification);
    const url = this.safeUrl(notification.data?.url);
    this.closePanel();
    if (url) {
      void this.router.navigateByUrl(url);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.panelOpen()) return;
    const target = event.target as Node | null;
    if (target && !this.host.nativeElement.contains(target)) {
      this.closePanel();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closePanel();
  }

  private safeUrl(raw: unknown): string | null {
    const value = typeof raw === 'string' ? raw : '';
    if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
    return value;
  }
}
