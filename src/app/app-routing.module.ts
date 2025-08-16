import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) },
  { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule) },
  { path: 'auth', loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule) },
  { path: 'booking', loadChildren: () => import('./pages/booking/booking.module').then(m => m.BookingModule) },
  { path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'place-details/:id', loadChildren: () => import('./pages/place-details/place-details.module').then(m => m.PlaceDetailsModule) },
  { path: 'trip-details/:id', loadChildren: () => import('./pages/trip-details/trip-details.module').then(m => m.TripDetailsModule) },
  { path: 'trip-feed', loadChildren: () => import('./pages/trip-feed/trip-feed.module').then(m => m.TripFeedModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
