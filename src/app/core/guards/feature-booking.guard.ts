import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { environment } from '../../../environments/environment';

/**
 * Blocks access to booking and marketplace routes when the feature is
 * disabled in environment config. Used to keep payment-dependent flows
 * out of the public beta until Razorpay verification + webhook signatures
 * are in place.
 */
export const featureBookingGuard: CanActivateFn = () => {
    const router = inject(Router);
    if (environment.featureBookingEnabled) {
        return true;
    }
    return router.createUrlTree(['/home']);
};
