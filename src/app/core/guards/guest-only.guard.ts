import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';

/**
 * Guard that redirects authenticated users away from login/register pages.
 * Use this on auth routes to redirect already logged-in users to home.
 */
export const guestOnlyGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // If user is authenticated (not a guest), redirect to home
    if (authService.isAuthenticatedUser()) {
        return router.createUrlTree(['/home']);
    }

    // Allow access for guests and unauthenticated users
    return true;
};
