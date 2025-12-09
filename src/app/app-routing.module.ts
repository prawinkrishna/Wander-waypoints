import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule) },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule),
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
    path: 'trip-feed',
    loadChildren: () => import('./pages/trip-feed/trip-feed.module').then(m => m.TripFeedModule),
    canActivate: [authGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
