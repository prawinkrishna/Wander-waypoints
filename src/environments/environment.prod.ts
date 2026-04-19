export const environment = {
  production: true,
  apiUrl: 'https://trekio-api.onrender.com/api',
  // Hide booking & marketplace flows for the public beta. Set to true once
  // Razorpay verification + webhook signatures land (Tier 3 in launch plan).
  featureBookingEnabled: false,
  // OAuth 2.0 Client ID from Google Cloud Console. Required for the
  // "Continue with Google" button to function. Until this is set, the
  // button is hidden gracefully.
  googleClientId: '',
  // GA4 Measurement ID (e.g., G-ABC123XYZ) — also referenced from index.html.
  gaMeasurementId: '',
  // Sentry DSN for error tracking.
  sentryDsn: '',
};
