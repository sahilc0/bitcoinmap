"use client";

import { useEffect, useState, useCallback } from "react";
import { parseJwt } from "@/lib/parseJwt";

interface UseAppleSignInReturn {
  signIn: () => Promise<string | null>;
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useAppleSignIn(): UseAppleSignInReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
    if (!clientId) {
      return;
    }

    // Check if already loaded
    if (window.AppleID) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.onload = () => {
      if (window.AppleID) {
        window.AppleID.auth.init({
          clientId,
          scope: "email",
          redirectURI: window.location.origin,
          usePopup: true,
        });
        setIsLoaded(true);
      }
    };
    script.onerror = () => {
      setError(new Error("Failed to load Apple Sign-In SDK"));
    };

    document.head.appendChild(script);
  }, []);

  const signIn = useCallback(async (): Promise<string | null> => {
    if (!isLoaded || !window.AppleID) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await window.AppleID.auth.signIn();
      const { id_token } = response.authorization;
      const claims = parseJwt(id_token);
      const email = claims.email as string | undefined;
      return email || null;
    } catch (err) {
      // User cancelled or sign-in failed
      if (err instanceof Error && err.message !== "popup_closed_by_user") {
        setError(err);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded]);

  return { signIn, isLoaded, isLoading, error };
}
