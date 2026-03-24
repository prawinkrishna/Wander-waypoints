import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AgentService } from '../../../core/service/agent.service';
import { ConfirmDialogComponent } from '../../../components/shared/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-itinerary-list',
    templateUrl: './itinerary-list.component.html',
    styleUrls: ['./itinerary-list.component.scss']
})
export class ItineraryListComponent implements OnInit {
    itineraries: any[] = [];
    isLoading = true;

    constructor(
        private agentService: AgentService,
        private router: Router,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.loadItineraries();
    }

    loadItineraries() {
        this.isLoading = true;
        this.agentService.getMyItineraries().subscribe({
            next: (trips) => {
                this.itineraries = trips;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading itineraries:', error);
                this.isLoading = false;
                this.snackBar.open('Failed to load itineraries', 'Close', { duration: 5000 });
            }
        });
    }

    editItinerary(tripId: string) {
        this.router.navigate(['/studio/edit-itinerary', tripId]);
    }

    downloadPdf(tripId: string, event: Event) {
        event.stopPropagation();
        this.agentService.downloadPdf(tripId).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `itinerary-${tripId}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: () => {
                this.snackBar.open('Failed to download PDF', 'Close', { duration: 3000 });
            }
        });
    }

    deleteItinerary(tripId: string, event: Event) {
        event.stopPropagation();

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Delete Itinerary',
                message: 'Are you sure you want to delete this itinerary?',
                type: 'danger',
                confirmText: 'Delete',
                cancelText: 'Cancel'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (!confirmed) return;

            this.agentService.deleteItinerary(tripId).subscribe({
                next: () => {
                    this.itineraries = this.itineraries.filter(i => i.tripId !== tripId);
                    this.snackBar.open('Itinerary deleted', 'Close', { duration: 3000 });
                },
                error: () => {
                    this.snackBar.open('Failed to delete itinerary', 'Close', { duration: 3000 });
                }
            });
        });
    }

    createNew() {
        this.router.navigate(['/studio/create-itinerary']);
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    formatCurrency(amount: number | undefined): string {
        if (!amount) return '-';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    getDuration(trip: any): string {
        if (!trip.startDate || !trip.endDate) return '-';
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return `${days}D/${days - 1}N`;
    }
}
