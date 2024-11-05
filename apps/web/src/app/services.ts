function getServicesUrl() {
  let url = process.env.NEXT_PUBLIC_SERVICES_URL ?? "";
  if (url === "") {
    // Explicitly use localhost:8000 as the default backend URL
    url = "http://localhost:8000";
  }
  return url.replace(/\/$/, ''); // Remove trailing slash if present
}

export const SERVICES_URL = getServicesUrl();

// Helper function to construct full API URLs
export function getFullApiUrl(path: string) {
  return `${SERVICES_URL}${path.startsWith('/') ? path : '/' + path}`;
}

// Explicitly export the base services URL for axios compatibility
export const BASE_SERVICES_URL = SERVICES_URL;
