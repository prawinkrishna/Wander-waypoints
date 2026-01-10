import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';

/**
 * Guard that only allows authenticated (non-guest) users.
 * Guests are redirected to login page.
 */
export const authenticatedUserGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Check if user is authenticated AND not a guest
    if (authService.isAuthenticatedUser()) {
        return true;
    }

    // Redirect guests and unauthenticated users to login
    return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
    });
};
