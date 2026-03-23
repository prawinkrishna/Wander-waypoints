import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';

/**
 * Guard that only allows authenticated users who have a linked agency.
 * Used to protect /studio/* routes — users without an agency (e.g. EXPLORER role)
 * are redirected to /home.
 */
export const agencyGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticatedUser()) {
        return router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url }
        });
    }

    if (authService.hasAgency()) {
        return true;
    }

    // Authenticated but no agency — redirect to home feed
    return router.createUrlTree(['/home']);
};
