export type MissionStatus = 'active' | 'pending' | 'closed';
export type HcrSector = 'Cuisine' | 'Service' | 'Bar' | 'Réception' | 'Ménage';

export interface Mission {
  id: string;
  title: string;
  company: string;
  location: string;
  sector: HcrSector;
  startDate: string;
  endDate: string;
  isPunctual?: boolean;
  status: MissionStatus;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  experience: string;
  initials: string;
  isAvailable: boolean;
}

export interface RecentActivity {
  id: string;
  type: 'user-check' | 'file-plus' | 'check' | 'building-plus';
  text: string;
  boldText: string;
  time: string;
  color: 'green' | 'gold' | 'blue';
}