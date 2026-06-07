import { type HcrSector } from './dashboard';

export interface ShiftSchedule {
  startHour: string;
  endHour: string;
  hasCut: boolean;
  secondStartHour?: string;
  secondEndHour?: string;
}

export interface CreateMissionInput {
  title: string;
  establishmentName: string;
  sector: HcrSector;
  startDate: string;
  endDate: string;
  ratePerHour: number;
  includeMealAllowance: boolean;
  schedule: ShiftSchedule;
  description: string;
}