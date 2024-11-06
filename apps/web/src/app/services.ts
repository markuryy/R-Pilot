function getServicesUrl() {
  return (process.env.NEXT_PUBLIC_SERVICES_URL ?? "http://localhost:8000").replace(/\/$/, '');
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
