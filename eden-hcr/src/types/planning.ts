import { type HcrSector } from './dashboard';

export interface HcrShift {
  id: string;
  candidateName: string;
  role: string;
  establishmentName: string;
  sector: HcrSector;
  date: string; // Format YYYY-MM-DD
  startHour: string;
  endHour: string;
  hasCut: boolean;
  secondStartHour?: string;
  secondEndHour?: string;
}