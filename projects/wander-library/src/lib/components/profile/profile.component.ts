import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

export interface UserProfile {
  userId: string;
  username: string;
  email?: string;
  bio?: string;
  location?: string;
  profileImage?: string;
  coverImage?: string;
  role?: string;
  createdAt?: string;
  isPublicProfile?: boolean;
  agencies?: any[];
  trips?: any[];
  followers?: any[];
  following?: any[];
}

export interface ProfileStats {
  trips: number;
  countries: number;
  followers: number;
  following: number;
}

@Component({
  selector: 'lib-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnChanges {
  // Input: User data to display
  @Input() user: UserProfile | null = null;

  // Input: Is this the current user's own profile?
  @Input() isOwnProfile: boolean = false;

  // Input: Follow status for other users' profiles
  @Input() followStatus: 'NONE' | 'PENDING' | 'ACCEPTED' = 'NONE';

  // Input: Loading state
  @Input() loading: boolean = false;

  // Output events
  @Output() followClicked = new EventEmitter<void>();
  @Output() unfollowClicked = new EventEmitter<void>();
  @Output() editProfileClicked = new EventEmitter<void>();
  @Output() tripClicked = new EventEmitter<string>();
  @Output() tabChanged = new EventEmitter<string>();

  activeTab: string = 'trips';
  tabs: string[] = ['trips', 'map', 'saved'];
  mapPlaces: any[] = [];
  savedTrips: any[] = [];
  savedVideoPlaces: any[] = [];

  @Input() set savedTripsInput(trips: any[]) {
    this.savedTrips = trips || [];
  }

  @Input() set savedVideoPlacesInput(places: any[]) {
    this.savedVideoPlaces = places || [];
  }

  profileStats: ProfileStats = {
    trips: 0,
    countries: 0,
    followers: 0,
    following: 0
  };

  ngOnInit(): void {
    this.calculateStats();
    this.extractMapPlaces();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']) {
      this.calculateStats();
      this.extractMapPlaces();
    }
  }

  private extractMapPlaces(): void {
    this.mapPlaces = [];
    if (!this.user?.trips) return;

    for (const trip of this.user.trips) {
      if (trip.tripPlaces) {
        for (const tp of trip.tripPlaces) {
          if (tp.place && tp.place.latitude && tp.place.longitude) {
            this.mapPlaces.push(tp.place);
          }
        }
      }
    }
  }

  calculateStats(): void {
    if (!this.user) return;

    // Calculate countries from trip places
    const countries = new Set<string>();
    if (this.user.trips) {
      for (const trip of this.user.trips) {
        if (trip.tripPlaces) {
          for (const tp of trip.tripPlaces) {
            if (tp.place?.country) {
              countries.add(tp.place.country);
            }
          }
        }
      }
    }

    this.profileStats = {
      trips: this.user.trips?.length || 0,
      countries: countries.size,
      followers: this.user.followers?.length || 0,
      following: this.user.following?.length || 0
    };
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.tabChanged.emit(tab);
  }

  onFollowClick(): void {
    if (this.followStatus === 'NONE') {
      this.followClicked.emit();
    } else {
      this.unfollowClicked.emit();
    }
  }

  onEditProfile(): void {
    this.editProfileClicked.emit();
  }

  onTripClick(tripId: string): void {
    this.tripClicked.emit(tripId);
  }

  getFollowButtonText(): string {
    switch (this.followStatus) {
      case 'ACCEPTED': return 'Following';
      case 'PENDING': return 'Requested';
      default: return 'Follow';
    }
  }

  getFollowButtonIcon(): string {
    switch (this.followStatus) {
      case 'ACCEPTED': return 'check';
      case 'PENDING': return 'hourglass_top';
      default: return 'person_add';
    }
  }

  getTripImage(trip: any): string {
    if (trip.coverImage) return trip.coverImage;
    if (trip.tripPlaces?.[0]?.place?.imageUrl) return trip.tripPlaces[0].place.imageUrl;
    return 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=400';
  }

  getDuration(trip: any): string {
    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return `${days} ${days === 1 ? 'Day' : 'Days'}`;
    }
    return '3 Days';
  }

  getDefaultAvatar(): string {
    return `https://ui-avatars.com/api/?name=${this.user?.username || 'User'}&background=667eea&color=fff`;
  }

  getDefaultCover(): string {
    return 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074';
  }

  getMemberSince(): string {
    if (!this.user?.createdAt) return 'Explorer';
    const date = new Date(this.user.createdAt);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}