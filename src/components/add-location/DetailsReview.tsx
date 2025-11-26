"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { type PlaceDetails } from "@/types/location";

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
    <form
      onSubmit={handleSubmit}
      className="space-y-6 animate-in slide-in-from-right duration-300"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Details</h2>
        <p className="text-muted-foreground">
          Check and edit the information we found
        </p>
      </div>

      {/* Form Fields */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-4">
          {/* Merchant Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Business Name</Label>
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
            <Label htmlFor="address">Address</Label>
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
            <Label htmlFor="category">Category</Label>
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
              <Label htmlFor="website">Website</Label>
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
              <Label htmlFor="phone">Phone</Label>
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
        </CardContent>
      </Card>

      {/* Payment Method Note */}
      <Card className="bg-accent border-accent-foreground/10 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-primary mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">Lightning Payment</p>
              <p className="text-sm text-muted-foreground mt-1">
                This location will be marked as accepting Bitcoin via Lightning
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 text-base"
        >
          Back
        </Button>
        <Button type="submit" className="flex-1 h-12 text-base font-semibold">
          Continue
        </Button>
      </div>
    </form>
  );
}
