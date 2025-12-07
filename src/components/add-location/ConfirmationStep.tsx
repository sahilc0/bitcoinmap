"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { type PlaceDetails, type LocationSubmission } from "@/types/location";
import { StaggerContainer, StaggerItem } from "@/components/ui/animations";

const EMAIL_STORAGE_KEY = "btcmap_user_email";

interface ConfirmationStepProps {
  placeDetails: PlaceDetails;
  onSubmit: (submission: LocationSubmission) => void;
  onBack: () => void;
}

export function ConfirmationStep({
  placeDetails,
  onSubmit,
  onBack,
}: ConfirmationStepProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Detect platform for OAuth button display
  const isMac = typeof window !== "undefined" && navigator.platform.includes("Mac");
  const isIOS =
    typeof window !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid =
    typeof window !== "undefined" && /Android/.test(navigator.userAgent);

  const showAppleSignIn = isMac || isIOS;
  const showGoogleSignIn = isAndroid || !showAppleSignIn;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setIsSubmitting(true);

    // Save email to localStorage for future submissions
    localStorage.setItem(EMAIL_STORAGE_KEY, email);

    const submission: LocationSubmission = {
      ...placeDetails,
      email,
      paymentMethods: ["lightning"],
      dataSource: "other",
    };

    await onSubmit(submission);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <StaggerContainer className="space-y-6">
        {/* Header */}
        <StaggerItem className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground/90">Almost done!</h2>
          <p className="text-muted-foreground">
            We'll contact you if we need more info
          </p>
        </StaggerItem>

        {/* Summary Card */}
        <StaggerItem>
          <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Business</p>
              <p className="font-semibold">{placeDetails.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="text-sm">{placeDetails.address}</p>
            </div>
            {placeDetails.category && (
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-sm">{placeDetails.category}</p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      </StaggerItem>

      {/* OAuth Buttons (UI Only - will be wired later) */}
      <StaggerItem className="space-y-3">
        {showAppleSignIn && (
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-semibold"
            disabled
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
            <span className="ml-2 text-xs text-muted-foreground">(Coming Soon)</span>
          </Button>
        )}

        {showGoogleSignIn && (
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-semibold"
            disabled
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
            <span className="ml-2 text-xs text-muted-foreground">(Coming Soon)</span>
          </Button>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>
      </StaggerItem>

      {/* Email Input */}
      <StaggerItem>
        <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="text-base h-12"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              We'll only use this to follow up if needed
            </p>
          </div>
          </CardContent>
        </Card>
      </StaggerItem>

      {/* Action Buttons */}
      <StaggerItem className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 h-12 text-base"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !email}
          className="flex-1 h-12 text-base font-semibold"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></span>
              Submitting...
            </span>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit
            </>
          )}
        </Button>
      </StaggerItem>
      </StaggerContainer>
    </form>
  );
}
