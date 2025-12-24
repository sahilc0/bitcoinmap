"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { parseJwt } from "@/lib/parseJwt";

interface UseGoogleSignInReturn {
  signIn: () => Promise<string | null>;
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useGoogleSignIn(): UseGoogleSignInReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const resolveRef = useRef<((email: string | null) => void) | null>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return;
    }

    // Check if already loaded
    if (window.google?.accounts?.id) {
      initializeGoogle(clientId);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      initializeGoogle(clientId);
    };
    script.onerror = () => {
      setError(new Error("Failed to load Google Sign-In SDK"));
    };

    document.head.appendChild(script);

    function initializeGoogle(id: string) {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: id,
        callback: (response) => {
          const claims = parseJwt(response.credential);
          const email = claims.email as string | undefined;
          if (resolveRef.current) {
            resolveRef.current(email || null);
            resolveRef.current = null;
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      setIsLoaded(true);
    }
  }, []);

  const signIn = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!isLoaded || !window.google?.accounts?.id) {
        resolve(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      resolveRef.current = (email) => {
        setIsLoading(false);
        resolve(email);
      };

      // Trigger the One Tap prompt
      window.google.accounts.id.prompt((notification) => {
        if (
          notification.isNotDisplayed() ||
          notification.isSkippedMoment() ||
          notification.isDismissedMoment()
        ) {
          setIsLoading(false);
          resolveRef.current = null;
          resolve(null);
        }
      });
    });
  }, [isLoaded]);

  return { signIn, isLoaded, isLoading, error };
}
