import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { EditProfileComponent } from './pages/edit-profile.component';
import { SettingsComponent } from './pages/settings.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule) },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'profile/edit',
    component: EditProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'profile/:id',
    component: UserProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    component: UserProfileComponent,
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
  {
    path: 'ai-planner',
    loadChildren: () => import('./features/ai-planner/ai-planner.module').then(m => m.AiPlannerModule),
    canActivate: [authGuard]
  },
  {
    path: 'agency',
    loadChildren: () => import('./pages/agency/agency.module').then(m => m.AgencyModule),
    canActivate: [authGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
