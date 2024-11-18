import { Component } from '@angular/core';

interface UserProfile {
  name: string;
  username: string;
  bio: string;
  location: string;
  joinDate: string;
  profileImage: string;
  coverImage: string;
  stats: {
    trips: number;
    countries: number;
    followers: number;
    following: number;
  };
  recentTrips: {
    id: number;
    location: string;
    country: string;
    date: string;
    imageUrl: string;
    likes: number;
    category: string;
  }[];
}


@Component({
  selector: 'lib-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  activeTab: string = 'Trips';
  
  tabs: string[] = ['Trips', 'Gallery', 'Saved', 'Achievements'];
 
  userProfile: UserProfile = {
    name: "Emma Adventurer",
    username: "@emma_travels",
    bio: "Exploring the world one destination at a time. Travel photographer and adventure seeker.",
    location: "San Francisco, CA",
    joinDate: "March 2023",
    profileImage: "/api/placeholder/200/200",
    coverImage: "/api/placeholder/1200/400",
    stats: {
      trips: 24,
      countries: 15,
      followers: 3456,
      following: 287
    },
    recentTrips: [
      {
        id: 1,
        location: "Santorini",
        country: "Greece",
        date: "March 2024",
        imageUrl: "/api/placeholder/400/300",
        likes: 456,
        category: "Island Getaway"
      },
      {
        id: 2,
        location: "Banff National Park",
        country: "Canada",
        date: "January 2024",
        imageUrl: "/api/placeholder/400/300",
        likes: 389,
        category: "Mountain Expedition"
      },
      {
        id: 3,
        location: "Tokyo",
        country: "Japan",
        date: "November 2023",
        imageUrl: "/api/placeholder/400/300",
        likes: 621,
        category: "City Exploration"
      }
    ]
  };
  profileStats = [
    { label: 'Trips', value: this.userProfile.stats.trips },
    { label: 'Countries', value: this.userProfile.stats.countries },
    { label: 'Followers', value: this.userProfile.stats.followers },
    { label: 'Following', value: this.userProfile.stats.following },
  ];
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}