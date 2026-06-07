import { type HcrSector } from './dashboard';

export type CandidateStatus = 'available' | 'assigned' | 'unavailable';

export interface HcrCandidate {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  primarySector: HcrSector;
  role: string;
  experienceYears: number;
  isHaccpCertified: boolean; // Critique pour la cuisine/service
  isBilingual: boolean;      // Important pour les établissements ★★★★
  rating: number;            // Note de satisfaction client (/5)
  status: CandidateStatus;
  phoneNumber: string;
  currentLocation: string;
}