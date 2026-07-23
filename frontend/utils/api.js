/**
 * Frontend API Utility Helper
 * Dynamically resolves the API base URL from VITE_BACKEND_URL environment variable.
 * If VITE_BACKEND_URL is defined, it prepends it to the endpoint path.
 * If VITE_BACKEND_URL is not set, it uses relative pathing (e.g. /api/...) for same-origin or Vite proxying.
 */

const rawBackendUrl = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_BACKEND_URL || '') : '';
export const BACKEND_URL = rawBackendUrl.replace(/\/+$/, '');

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return BACKEND_URL ? `${BACKEND_URL}${cleanEndpoint}` : cleanEndpoint;
};
