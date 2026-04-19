export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  // Hide booking & marketplace flows for the public beta. Set to true once
  // Razorpay verification + webhook signatures land (Tier 3 in launch plan).
  featureBookingEnabled: false,
  // OAuth 2.0 Client ID from Google Cloud Console (APIs & Services →
  // Credentials → OAuth 2.0 Client IDs → Web application). Required for
  // the "Continue with Google" button to function. Until this is set,
  // the button is hidden gracefully.
  googleClientId: '1028529572160-csql6t91qhue0d9td4jl788ev9ageksv.apps.googleusercontent.com',
  // GA4 Measurement ID (e.g., G-ABC123XYZ) — also referenced from index.html.
  // Leave blank in dev to avoid polluting the production analytics dashboard.
  gaMeasurementId: '',
  // Sentry DSN for error tracking. Leave blank in dev.
  sentryDsn: '',
};
