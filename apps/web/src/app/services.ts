function getServicesUrl() {
  // Check if we're in a browser context
  const isBrowser = typeof window !== 'undefined';
  
  // Get configured services URL from env
  let url = process.env.NEXT_PUBLIC_SERVICES_URL ?? "";
  
  if (url === "") {
    if (isBrowser) {
      // In browser, use relative URL to current host if no explicit URL set
      // This helps with Docker deployments where the hostname might change
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      // Use port 8000 only in development (localhost)
      const port = hostname === 'localhost' ? ':8000' : '';
      url = `${protocol}//${hostname}${port}`;
    } else {
      // In SSR context, fallback to localhost
      url = "http://localhost:8000";
    }
  }
  
  return url.replace(/\/$/, ''); // Remove trailing slash if present
}

export const SERVICES_URL = getServicesUrl();

// Helper function to construct API URLs
export function getFullApiUrl(path: string) {
  // For absolute URLs (including protocol), use as-is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Ensure path starts with slash
  const normalizedPath = path.startsWith('/') ? path : '/' + path;
  
  // If SERVICES_URL is relative (no protocol), return relative path
  if (!SERVICES_URL.startsWith('http')) {
    return normalizedPath;
  }
  
  // Otherwise return full URL
  return `${SERVICES_URL}${normalizedPath}`;
}

// Explicitly export the base services URL for axios compatibility
export const BASE_SERVICES_URL = SERVICES_URL;
