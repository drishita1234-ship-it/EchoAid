export enum EmergencyType {
  Medical = 'Medical',
  Fire = 'Fire',
  Flood = 'Flood',
  Earthquake = 'Earthquake',
  Other = 'Other',
}

export enum UrgencyLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Critical = 'Critical',
}

export enum UserRole {
  Requester = 'Requester',
  Volunteer = 'Volunteer',
  Safe = 'Safe',
}

export enum RequestStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
  Queued = 'Queued',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePhoto?: string;
  location?: LocationCoords;
  skills?: string[];
  isAegisVerified?: boolean;
  affiliation?: string;
}

export interface SOSRequest {
  id: string;
  name?: string;
  requesterId: string;
  volunteerId?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  emergencyType: EmergencyType;
  description: string;
  mediaUrl?: string;
  timestamp: string;
  urgencyScore: number; // 1-10, determined by AI
  status: RequestStatus;
  lastPulseTimestamp?: string;
  verificationState?: VerificationState;
  officialSource?: string; // e.g., 'IMD', 'CWC'
  clusterCount?: number;
  confidenceScore?: number;
  verificationDetails?: {
    clusterAnalysis?: string;
    socialMedia?: { text: string; url?: string; thumbnail?: string; };
    sensorData?: string;
    userHistory?: string;
    seismicData?: string;
  };
  responderVerificationCode?: string;
}

export interface LocationCoords {
    lat: number;
    lng: number;
}

export enum VerificationState {
  Unverified = 'Unverified',
  ClusterVerified = 'ClusterVerified',
  AegisVerified = 'AegisVerified',
  OfficiallyVerified = 'OfficiallyVerified',
}

export enum RumorState {
  Investigating = 'Investigating',
  Debunked = 'Debunked',
  Confirmed = 'Confirmed',
}

export interface Rumor {
  id: string;
  title: string;
  state: RumorState;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
  };
  details: {
    description: string;
    sourceOfTruth?: string; // e.g., 'Aegis AI (Live Camera)', 'Hazmat Team 4'
  };
}

export interface OfficialAlert {
    id: string;
    source: 'IMD' | 'CWC' | 'NCS';
    title: string;
    description: string;
    severity: 'Red Alert' | 'Orange Alert' | 'Warning' | 'Danger Level';
    timestamp: string;
    affectedArea: string;
}
