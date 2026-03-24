import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BookingService, Booking } from '../../core/service/booking.service';
import { ConfirmDialogComponent } from '../../components/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss']
})
export class BookingPage implements OnInit {
  bookings: Booking[] = [];
  loading = true;
  activeTab = 0;

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  private loadBookings() {
    this.loading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.loading = false;
      },
      error: () => {
        this.bookings = [];
        this.loading = false;
      }
    });
  }

  get upcomingBookings(): Booking[] {
    return this.bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  }

  get pastBookings(): Booking[] {
    return this.bookings.filter(b => b.status === 'completed');
  }

  get cancelledBookings(): Booking[] {
    return this.bookings.filter(b => b.status === 'cancelled' || b.status === 'refunded');
  }

  viewTrip(tripId: string) {
    this.router.navigate(['/trip-details', tripId]);
  }

  cancelBooking(booking: Booking) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel Booking',
        message: 'Are you sure you want to cancel this booking?',
        type: 'warning',
        confirmText: 'Cancel Booking',
        cancelText: 'Keep'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.bookingService.cancelBooking(booking.bookingId).subscribe({
        next: (updated) => {
          const idx = this.bookings.findIndex(b => b.bookingId === updated.bookingId);
          if (idx !== -1) {
            this.bookings[idx] = updated;
          }
        }
      });
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'warn';
      case 'confirmed': return 'primary';
      case 'completed': return 'accent';
      case 'cancelled':
      case 'refunded': return 'warn';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled':
      case 'refunded': return 'status-cancelled';
      default: return '';
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR'
    }).format(amount);
  }
}
