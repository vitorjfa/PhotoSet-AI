
export interface Camera {
  id: string;
  brand: string;
  model: string;
  maxIso: number;
}

export interface Lens {
  id: string;
  name: string;
  maxAperture: number; // e.g., 1.8, 4.5
  isZoom: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Recommendation {
  mode: string;
  iso: string;
  aperture: string;
  shutter: string;
  wb: string;
  focusMode: string;
  focusPoints: string;
  metering: string;
  reason: string;
  tips: string[];
  composition: string[];
  alerts: string[];
}

export interface Favorite {
  id: string;
  camera: Camera;
  lens: Lens;
  scenario: Scenario;
  recommendation: Recommendation;
  date: string;
}
