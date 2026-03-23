import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Create an anonymous token to allow read-only browsing
    return authService.anonymousLogin().pipe(
        map(() => true),
        catchError(() => of(router.createUrlTree(['/login'])))
    );
};
