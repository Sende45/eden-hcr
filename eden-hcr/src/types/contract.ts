export type ContractStatus = 'pending_signature' | 'signed' | 'archived';

export interface HcrContract {
  id: string;
  candidateName: string;
  establishmentName: string;
  role: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  grossAmount: number;
  status: ContractStatus;
  downloadUrl?: string;
}