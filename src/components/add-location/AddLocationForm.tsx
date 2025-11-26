"use client";

import { useState } from "react";
import { FormStep, type PlaceDetails, type LocationSubmission } from "@/types/location";
import { MerchantSearch } from "./MerchantSearch";
import { DetailsReview } from "./DetailsReview";
import { ConfirmationStep } from "./ConfirmationStep";
import { SuccessScreen } from "./SuccessScreen";

export function AddLocationForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.SEARCH);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePlaceSelect = (details: PlaceDetails) => {
    setPlaceDetails(details);
    setCurrentStep(FormStep.DETAILS);
  };

  const handleDetailsConfirm = (details: PlaceDetails) => {
    setPlaceDetails(details);
    setCurrentStep(FormStep.CONFIRMATION);
  };

  const handleBack = () => {
    if (currentStep === FormStep.DETAILS) {
      setCurrentStep(FormStep.SEARCH);
    } else if (currentStep === FormStep.CONFIRMATION) {
      setCurrentStep(FormStep.DETAILS);
    }
  };

  const handleSubmit = async (submission: LocationSubmission) => {
    try {
      const response = await fetch("/api/submit-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submission),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Submission failed");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit location. Please try again.");
    }
  };

  const handleAddAnother = () => {
    setCurrentStep(FormStep.SEARCH);
    setPlaceDetails(null);
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return <SuccessScreen onAddAnother={handleAddAnother} />;
  }

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Header - hidden on initial search step */}
      {currentStep !== FormStep.SEARCH && (
        <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            {currentStep > FormStep.SEARCH && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Go back"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <h1 className="text-lg font-semibold">Add Location</h1>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main
        className={`max-w-2xl mx-auto px-4 ${
          currentStep === FormStep.SEARCH ? "py-8" : "py-6"
        }`}
      >
        {currentStep === FormStep.SEARCH && (
          <MerchantSearch onSelect={handlePlaceSelect} />
        )}
        {currentStep === FormStep.DETAILS && placeDetails && (
          <DetailsReview
            initialDetails={placeDetails}
            onConfirm={handleDetailsConfirm}
            onBack={handleBack}
          />
        )}
        {currentStep === FormStep.CONFIRMATION && placeDetails && (
          <ConfirmationStep
            placeDetails={placeDetails}
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  );
}
