// Dynamically compute the backend URL based on the current hostname.
// This allows friends on the same local network to connect to your dev server.
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:5000`;
