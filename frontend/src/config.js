// Local development keeps the existing Express fallback; hosted builds use
// the same-origin API unless Vercel is configured with a Render URL.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5001/api' : '/api')
