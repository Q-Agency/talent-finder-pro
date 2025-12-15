/**
 * Central API configuration.
 *
 * Note: In Vite, `import.meta.env` values are baked at build time.
 * For server deployments, set VITE_API_BASE_URL during the build step.
 */
export const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://192.168.20.70:5678";


