"use client";

import React, { createContext } from "react";
import axios from "axios";
import { getFullApiUrl } from "./services";

export const AuthContext = createContext<string | null>(null);

export const AUTH_ERROR_MSG =
  "Could not authenticate to backend. This probably means there is no or an invalid authentication token provided in the URL. Please check the startup console output of the backend and add a valid token to the URL.";

export default function Authentication({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    // First check URL hash for token (for shared links)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    let urlToken = hashParams.get("token");
    
    // Then check URL params (for direct links)
    if (!urlToken) {
      const queryParams = new URLSearchParams(window.location.search);
      urlToken = queryParams.get("token");
    }

    // If token found in URL, save it and clean URL
    if (urlToken) {
      localStorage.setItem("auth_token", urlToken);
      // Clean up URL without reloading page
      const newUrl = window.location.pathname + 
        window.location.search.replace(/[?&]token=[^&]+/, '') +
        window.location.hash.replace(/[#&]token=[^&]+/, '');
      window.history.replaceState({}, '', newUrl);
    }

    // Get token from storage or keep URL token
    const storedToken = localStorage.getItem("auth_token");
    const finalToken = urlToken || storedToken;

    if (finalToken) {
      // Use relative URL for better Docker compatibility
      axios
        .post(getFullApiUrl("/api/auth/verify"), {
          token: finalToken,
        })
        .then(() => {
          setToken(finalToken);
        })
        .catch((error) => {
          console.error("Authentication failed:", error);
          // Clear invalid token
          localStorage.removeItem("auth_token");
        });
    }
  }, []);

  return <AuthContext.Provider value={token}>{children}</AuthContext.Provider>;
}
