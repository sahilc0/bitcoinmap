"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { type PlaceDetails } from "@/types/location";
import { StaggerContainer, StaggerItem } from "@/components/ui/animations";

interface DetailsReviewProps {
  initialDetails: PlaceDetails;
  onConfirm: (details: PlaceDetails) => void;
  onBack: () => void;
}

export function DetailsReview({
  initialDetails,
  onConfirm,
  onBack,
}: DetailsReviewProps) {
  const [details, setDetails] = useState<PlaceDetails>(initialDetails);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(details);
  };

  const updateField = (field: keyof PlaceDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[65vh]">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <StaggerContainer className="space-y-6">
          {/* Header */}
          <StaggerItem>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Review details</h2>
            <p className="text-muted-foreground">
              Double check the information that we found
            </p>
          </StaggerItem>

          {/* Form Fields */}
          <StaggerItem className="space-y-5">
            {/* Merchant Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground text-sm font-medium">Business name</Label>
              <Input
                id="name"
                type="text"
                value={details.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Business name"
                required
                className="text-base h-12"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-muted-foreground text-sm font-medium">Address</Label>
              <Input
                id="address"
                type="text"
                value={details.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Full address"
                required
                className="text-base h-12"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-muted-foreground text-sm font-medium">Category</Label>
              <Input
                id="category"
                type="text"
                value={details.category || ""}
                onChange={(e) => updateField("category", e.target.value)}
                placeholder="e.g., Restaurant, Cafe, Store"
                className="text-base h-12"
              />
            </div>

            {/* Website */}
            {details.website && (
              <div className="space-y-2">
                <Label htmlFor="website" className="text-muted-foreground text-sm font-medium">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={details.website || ""}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://..."
                  className="text-base h-12"
                />
              </div>
            )}

            {/* Phone */}
            {details.phone && (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-muted-foreground text-sm font-medium">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={details.phone || ""}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="Phone number"
                  className="text-base h-12"
                />
              </div>
            )}
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* Pinned action buttons */}
      <div className="flex-shrink-0 pt-6 border-t border-border mt-6">
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full sm:flex-1 h-12 text-base"
          >
            Back
          </Button>
          <Button type="submit" className="w-full sm:flex-1 h-12 text-base font-semibold">
            Continue
          </Button>
        </div>
      </div>
    </form>
  );
}
