import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';

/**
 * Guard that redirects authenticated users away from login/register/welcome pages.
 * Use this on public routes to redirect already logged-in users to dashboard.
 */
export const guestOnlyGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // If user is authenticated (not a guest), redirect based on role
    if (authService.isAuthenticatedUser()) {
        return router.createUrlTree([authService.getDefaultRoute()]);
    }

    // Allow access for guests and unauthenticated users
    return true;
};
