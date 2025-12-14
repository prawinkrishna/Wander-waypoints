import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService } from '../../core/service/trip.service';
import { AuthService } from '../../core/service/auth.service';
import { MatDialog } from '@angular/material/dialog';

interface Trip {
  tripId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  visibility: string;
  userId: string;
  user?: {
    username: string;
    email: string;
  };
  places?: any[];
  likes?: number;
  comments?: any[];
  isLiked?: boolean;
}

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.page.html',
  styleUrls: ['./trip-details.page.scss']
})
export class TripDetailsPage implements OnInit {
  tripId: string = '';
  trip: Trip | null = null;
  isLoading = true;
  error: string | null = null;
  isOwner = false;
  currentUserId: string | null = null;

  // Comments
  newComment = '';
  isAddingComment = false;



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.tripId = this.route.snapshot.paramMap.get('id') || '';
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.userId || null;

    if (this.tripId) {
      this.loadTripDetails();
    } else {
      this.error = 'Invalid trip ID';
      this.isLoading = false;
    }
  }

  loadTripDetails() {
    this.isLoading = true;
    this.error = null;

    this.tripService.getTrip(this.tripId).subscribe({
      next: (trip) => {
        this.trip = trip;
        this.isOwner = this.currentUserId === trip.userId;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading trip:', err);
        this.error = 'Failed to load trip details. The trip may not exist or you may not have permission to view it.';
        this.isLoading = false;
      }
    });
  }

  onLike() {
    if (!this.trip) return;

    this.tripService.likeTrip(this.trip.tripId).subscribe({
      next: () => {
        if (this.trip) {
          this.trip.isLiked = !this.trip.isLiked;
          this.trip.likes = (this.trip.likes || 0) + (this.trip.isLiked ? 1 : -1);
        }
      },
      error: (err) => {
        console.error('Error liking trip:', err);
      }
    });
  }

  onAddComment() {
    if (!this.trip || !this.newComment.trim()) return;

    this.isAddingComment = true;
    this.tripService.commentOnTrip(this.trip.tripId, this.newComment).subscribe({
      next: (comment) => {
        if (this.trip) {
          this.trip.comments = this.trip.comments || [];
          this.trip.comments.unshift(comment);
          this.newComment = '';
        }
        this.isAddingComment = false;
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.isAddingComment = false;
      }
    });
  }

  onEdit() {
    if (!this.trip) return;
    // Navigate to edit page or open edit dialog
    this.router.navigate(['/trip-edit', this.trip.tripId]);
  }

  onDelete() {
    if (!this.trip) return;

    const confirmed = confirm(`Are you sure you want to delete "${this.trip.title}"? This action cannot be undone.`);
    if (confirmed) {
      this.tripService.deleteTrip(this.trip.tripId).subscribe({
        next: () => {
          this.router.navigate(['/profile']);
        },
        error: (err) => {
          console.error('Error deleting trip:', err);
          alert('Failed to delete trip. Please try again.');
        }
      });
    }
  }

  onShare() {
    if (!this.trip) return;

    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: this.trip.title,
        text: this.trip.description,
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getTripDuration(): string {
    if (!this.trip) return '';
    const start = new Date(this.trip.startDate);
    const end = new Date(this.trip.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days > 1 ? 's' : ''}`;
  }



  onPlaceDeleted(tripPlaceId: string) {
    if (!this.trip) return;
    
    // Optimistic update: Remove the place from the local array immediately
    this.trip.places = this.trip.places?.filter(p => p.tripPlaceId !== tripPlaceId) || [];
    
    this.tripService.deleteTripPlace(tripPlaceId).subscribe({
      next: () => console.log('Place deleted successfully from backend'),
      error: (err) => {
        console.error('Error deleting place:', err);
        // revert logic could happen here
        this.loadTripDetails(); // Reload to sync state if failed
      }
    });
  }

  onPlacesReordered(reorderedPlaces: any[]) {
    if (!this.trip) return;
    
    // Update the local trip places
    this.trip.places = reorderedPlaces;
    
    // Extract IDs in the new order
    const orderedIds = reorderedPlaces.map(p => p.tripPlaceId);

    this.tripService.reorderTripPlaces(this.trip.tripId, orderedIds).subscribe({
      next: () => console.log('Places reordered successfully on backend'),
      error: (err) => console.error('Error reordering places:', err)
    });
  }
}
