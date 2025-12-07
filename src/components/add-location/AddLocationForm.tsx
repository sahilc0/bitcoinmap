"use client";

import { useState, useRef } from "react";
import { FormStep, type PlaceDetails, type LocationSubmission } from "@/types/location";
import { MerchantSearch } from "./MerchantSearch";
import { DetailsReview } from "./DetailsReview";
import { ConfirmationStep } from "./ConfirmationStep";
import { SuccessScreen } from "./SuccessScreen";
import { SlideContainer, SlideContent } from "@/components/ui/animations";

export function AddLocationForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.SEARCH);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const directionRef = useRef(1); // 1 = forward, -1 = back

  const handlePlaceSelect = (details: PlaceDetails) => {
    directionRef.current = 1;
    setPlaceDetails(details);
    setCurrentStep(FormStep.DETAILS);
  };

  const handleDetailsConfirm = (details: PlaceDetails) => {
    directionRef.current = 1;
    setPlaceDetails(details);
    setCurrentStep(FormStep.CONFIRMATION);
  };

  const handleBack = () => {
    directionRef.current = -1;
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
    <div className="w-full">
      {/* Main Content */}
      <main
        className={`max-w-2xl mx-auto px-4 ${
          currentStep === FormStep.SEARCH ? "py-8" : "py-6"
        }`}
      >
        <SlideContainer direction={directionRef.current}>
          {currentStep === FormStep.SEARCH && (
            <SlideContent id="search" direction={directionRef.current}>
              <MerchantSearch onSelect={handlePlaceSelect} />
            </SlideContent>
          )}
          {currentStep === FormStep.DETAILS && placeDetails && (
            <SlideContent id="details" direction={directionRef.current}>
              <DetailsReview
                initialDetails={placeDetails}
                onConfirm={handleDetailsConfirm}
                onBack={handleBack}
              />
            </SlideContent>
          )}
          {currentStep === FormStep.CONFIRMATION && placeDetails && (
            <SlideContent id="confirmation" direction={directionRef.current}>
              <ConfirmationStep
                placeDetails={placeDetails}
                onSubmit={handleSubmit}
                onBack={handleBack}
              />
            </SlideContent>
          )}
        </SlideContainer>
      </main>
    </div>
  );
}
