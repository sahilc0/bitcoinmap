export interface PlaceDetails {
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  category?: string;
  website?: string;
  phone?: string;
  openingHours?: string;
  placeId?: string;
}

export interface LocationSubmission extends PlaceDetails {
  email: string;
  paymentMethods: string[];
  dataSource: string;
}

export enum FormStep {
  SEARCH = 0,
  DETAILS = 1,
  CONFIRMATION = 2,
}
