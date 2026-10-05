export type Role = 'DONOR' | 'SEEKER' | 'VERIFIER' | 'ADMIN';

export type DeviceCategory =
  | 'WHEELCHAIR'
  | 'HEARING_AID'
  | 'CRUTCH'
  | 'TRICYCLE'
  | 'BRAILLE_KIT'
  | 'PROSTHETIC';

export type DeviceStatus =
  | 'AVAILABLE'
  | 'CERTIFYING'
  | 'MATCHED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'RE_LISTED';

export type Verdict = 'PENDING' | 'SAFE' | 'NOT_SAFE';

export type MatchStatus = 'PROPOSED' | 'ACCEPTED' | 'REJECTED' | 'CLOSED';

export type TransferStatus =
  | 'PLANNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export interface User {
  id: number;
  name: string;
  mobile: string;
  role: Role;
  language?: string;
  disabilityType?: string | null;
  isApproved?: boolean;
  lat?: number | null;
  lng?: number | null;
}

export interface DeviceType {
  id: number;
  category: DeviceCategory;
  label: string;
}

export interface Device {
  id: number;
  serial: string;
  donorId: number;
  donor?: User;
  typeId: number;
  type?: DeviceType;
  condition: string;
  description: string;
  lat?: number | null;
  lng?: number | null;
  status: DeviceStatus;
  listedAt: string;
  certifications?: Certification[];
  matches?: Match[];
}

export interface Need {
  id: number;
  seekerId: number;
  seeker?: User;
  category: DeviceCategory;
  urgencyHours: number;
  lat?: number | null;
  lng?: number | null;
  monthlyIncome?: number | null;
  status: DeviceStatus;
}

export interface Certification {
  id: number;
  deviceId: number;
  device?: Device;
  verifierId: number;
  verifier?: User;
  verdict: Verdict;
  notes?: string | null;
  certificateRef?: string | null;
  inspectedAt?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
}

export interface Match {
  id: number;
  deviceId: number;
  device?: Device;
  needId: number;
  need?: Need;
  score: number;
  source: string;
  status: MatchStatus;
  createdAt: string;
  transfers?: Transfer[];
}

export interface Transfer {
  id: number;
  matchId: number;
  match?: Match;
  pickupAddr: string;
  dropoffAddr: string;
  status: TransferStatus;
  costPaisa?: number | null;
  deliveredAt?: string | null;
  createdAt: string;
  feedback?: Feedback | null;
}

export interface Feedback {
  id: number;
  transferId: number;
  rating: number;
  notes?: string | null;
  reListIntent: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  tableName: string;
  recordId: number;
  action: string;
  payload?: any;
  actorId?: number | null;
  actor?: User | null;
  createdAt: string;
}

export interface DistrictAggregate {
  category: DeviceCategory;
  count_available: number;
  count_delivered: number;
}
