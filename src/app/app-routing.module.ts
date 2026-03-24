import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { authenticatedUserGuard } from './core/guards/authenticated-user.guard';
import { guestOnlyGuard } from './core/guards/guest-only.guard';
import { agencyGuard } from './core/guards/agency.guard';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { EditProfileComponent } from './pages/edit-profile.component';
import { SettingsComponent } from './pages/settings.component';
import { CreateTripComponent } from './pages/create-trip/create-trip.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { LegalComponent } from './pages/legal/legal.component';

const routes: Routes = [
  // Default to Welcome page for unauthenticated users
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },

  // Welcome page - public landing page
  {
    path: 'welcome',
    loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomeModule),
    canActivate: [guestOnlyGuard]
  },

  // Auth routes - redirect authenticated users based on role
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule),
    canActivate: [guestOnlyGuard]
  },
  {
    path: 'auth',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Shared itinerary - completely public, no auth (client-facing view)
  {
    path: 'shared',
    loadChildren: () => import('./pages/shared-itinerary/shared-itinerary.module').then(m => m.SharedItineraryModule)
  },

  // Studio - agent workspace (requires agency)
  {
    path: 'studio',
    loadChildren: () => import('./pages/studio/studio.module').then(m => m.StudioModule),
    canActivate: [agencyGuard]
  },

  // Public routes - guests and authenticated users allowed
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
    canActivate: [authGuard]
  },
  {
    path: 'trip-feed',
    loadChildren: () => import('./pages/trip-feed/trip-feed.module').then(m => m.TripFeedModule),
    canActivate: [authGuard]
  },
  {
    path: 'trip-details/:id',
    loadChildren: () => import('./pages/trip-details/trip-details.module').then(m => m.TripDetailsModule),
    canActivate: [authGuard]
  },
  {
    path: 'place-details/:id',
    loadChildren: () => import('./pages/place-details/place-details.module').then(m => m.PlaceDetailsModule),
    canActivate: [authGuard]
  },
  {
    path: 'ai-planner',
    redirectTo: 'create-trip',
    pathMatch: 'full'
  },

  // Protected routes - authenticated users only (no guests)
  // profile/edit MUST come before profile/:id to avoid "edit" matching :id
  {
    path: 'profile/edit',
    component: EditProfileComponent,
    canActivate: [authenticatedUserGuard]
  },
  {
    path: 'profile/:id',
    component: UserProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [authenticatedUserGuard]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authenticatedUserGuard]
  },
  {
    path: 'agency',
    loadChildren: () => import('./pages/agency/agency.module').then(m => m.AgencyModule),
    canActivate: [authenticatedUserGuard]
  },
  {
    path: 'booking',
    loadChildren: () => import('./pages/booking/booking.module').then(m => m.BookingModule),
    canActivate: [authenticatedUserGuard]
  },
  {
    path: 'create-trip',
    component: CreateTripComponent,
    canActivate: [authenticatedUserGuard]
  },
  {
    path: 'import',
    loadChildren: () => import('./pages/import/import.module').then(m => m.ImportModule),
    canActivate: [authenticatedUserGuard]
  },

  // Marketplace - public traveler-facing marketplace
  {
    path: 'marketplace',
    loadChildren: () => import('./pages/marketplace/marketplace.module').then(m => m.MarketplaceModule)
  },

  // Legal pages - public
  { path: 'privacy', component: LegalComponent, data: { page: 'privacy' } },
  { path: 'terms', component: LegalComponent, data: { page: 'terms' } },
  { path: 'contact', component: LegalComponent, data: { page: 'contact' } },

  // 404 - catch all unknown routes
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
