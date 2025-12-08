"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StaggerContainer, StaggerItem } from "@/components/ui/animations";

interface SuccessScreenProps {
  onAddAnother: () => void;
}

export function SuccessScreen({ onAddAnother }: SuccessScreenProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <StaggerContainer className="w-full max-w-md space-y-6">
        {/* Success Icon */}
        <StaggerItem className="flex justify-center">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </StaggerItem>

        {/* Success Message */}
        <StaggerItem className="text-center">
          <h2 className="text-3xl font-bold mb-3 text-foreground/90">All set!</h2>
          <p className="text-lg text-muted-foreground">
            Your submission has been received
          </p>
        </StaggerItem>

        {/* Info Card */}
        <StaggerItem>
          <div className="rounded-xl bg-secondary/50 p-4 space-y-3">
            <div className="flex gap-2.5">
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p>Under review</p>
                <p className="text-muted-foreground">Our community volunteers will review and add your location to the map</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <div>
                <p>Stay updated</p>
                <p className="text-muted-foreground">We'll email you if we need any additional information</p>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Action Buttons */}
        <StaggerItem className="space-y-3 pt-4">
          <Button
            onClick={onAddAnother}
            className="w-full h-12 text-base font-semibold"
          >
            Add another location
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => window.open("https://btcmap.org", "_blank")}
          >
            View the map
          </Button>
        </StaggerItem>

      </StaggerContainer>
    </div>
  );
}
