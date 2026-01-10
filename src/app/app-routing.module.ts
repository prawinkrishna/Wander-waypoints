import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { authenticatedUserGuard } from './core/guards/authenticated-user.guard';
import { guestOnlyGuard } from './core/guards/guest-only.guard';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { EditProfileComponent } from './pages/edit-profile.component';
import { SettingsComponent } from './pages/settings.component';
import { CreateTripComponent } from './pages/create-trip.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Auth routes - redirect authenticated users to home
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
    loadChildren: () => import('./features/ai-planner/ai-planner.module').then(m => m.AiPlannerModule),
    canActivate: [authGuard]
  },
  {
    path: 'profile/:id',
    component: UserProfileComponent,
    canActivate: [authGuard] // Allow guests to view other profiles
  },

  // Protected routes - authenticated users only (no guests)
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [authenticatedUserGuard]
  },
  {
    path: 'profile/edit',
    component: EditProfileComponent,
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

  // Wildcard - redirect unknown routes to home
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
