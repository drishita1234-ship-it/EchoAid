import { SOSRequest, User, UserRole, RequestStatus, EmergencyType, VerificationState, Rumor, RumorState, OfficialAlert } from './types';

export const DUMMY_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Arjun Sharma',
    email: 'requester@test.com',
    role: UserRole.Requester,
    location: { lat: 28.6139, lng: 77.2090 }, // Delhi
  },
  {
    id: 'user-2',
    name: 'David R.',
    email: 'volunteer@test.com',
    role: UserRole.Volunteer,
    location: { lat: 19.0760, lng: 72.8777 }, // Mumbai
    skills: ['First Aid', 'Driving'],
    isAegisVerified: true,
    affiliation: 'Mumbai Fire Brigade',
    profilePhoto: 'https://i.pravatar.cc/150?u=david-r'
  },
  {
    id: 'user-safe',
    name: 'Priya Sharma',
    email: 'safe@test.com',
    role: UserRole.Safe,
    location: { lat: 13.0827, lng: 80.2707 }, // Chennai
  },
];

export const DUMMY_SOS_REQUESTS: SOSRequest[] = [
  {
    id: 'sos-1',
    requesterId: 'user-1',
    volunteerId: 'user-2',
    name: "Arjun Sharma",
    location: {
      lat: 19.0760,
      lng: 72.8777,
      address: 'Bandra, Mumbai, Maharashtra',
    },
    emergencyType: EmergencyType.Medical,
    description: 'A person has fallen and needs immediate medical attention near Bandra station.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    urgencyScore: 9,
    status: RequestStatus.InProgress,
    verificationState: VerificationState.Unverified,
    responderVerificationCode: '88-ALPHA'
  },
  {
    id: 'sos-2',
    requesterId: 'user-1',
    name: "Arjun Sharma",
    location: {
      lat: 28.6358,
      lng: 77.2244,
      address: 'Chandni Chowk, Delhi',
    },
    emergencyType: EmergencyType.Fire,
    description: 'Shop on fire in Chandni Chowk, heavy smoke visible.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    urgencyScore: 7,
    status: RequestStatus.Pending,
    verificationState: VerificationState.ClusterVerified,
    clusterCount: 3,
  },
  {
    id: 'sos-3',
    requesterId: 'user-3', // a different user
    name: "Anjali Mehta",
    location: {
      lat: 13.0827,
      lng: 80.2707,
      address: 'T. Nagar, Chennai, Tamil Nadu',
    },
    emergencyType: EmergencyType.Flood,
    description: 'Street is flooding due to heavy rain, water entering homes.',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    urgencyScore: 8,
    status: RequestStatus.Pending,
    verificationState: VerificationState.OfficiallyVerified,
    officialSource: 'IMD',
  },
   {
    id: 'sos-4-aegis-verified',
    requesterId: 'user-4',
    name: "Ravi Kumar",
    location: {
      lat: 13.0674,
      lng: 80.2376,
      address: 'Adyar, Chennai, Tamil Nadu',
    },
    emergencyType: EmergencyType.Flood,
    description: "Our ground floor is completely flooded! The water is rising fast and we're trapped on the second floor.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    urgencyScore: 10,
    status: RequestStatus.Pending,
    verificationState: VerificationState.AegisVerified,
    confidenceScore: 95,
    clusterCount: 4,
    verificationDetails: {
      clusterAnalysis: '4 other SOS pings detected within a 200-meter radius.',
      socialMedia: {
        text: 'Cross-referenced 2 public photos (Twitter) showing flooding at this location.',
        thumbnail: 'https://images.unsplash.com/photo-1567471936733-3a95c4d327a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
      },
      sensorData: "Location is within the 'Severe Flood Warning' zone reported by the CWC.",
      userHistory: "User is a 'Trusted Reporter' (previously verified).",
      seismicData: 'No seismic activity detected.',
    },
  },
];

export const DUMMY_RUMORS: Rumor[] = [
  {
    id: 'rumor-1',
    title: 'Bridge collapse reported at ITO Bridge',
    state: RumorState.Investigating,
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    location: { lat: 28.6315, lng: 77.2502 }, // Delhi
    details: {
      description: 'Receiving a high volume of unverified reports about a potential collapse.',
    },
  },
  {
    id: 'rumor-2',
    title: 'Gas leak at Dadar West',
    state: RumorState.Debunked,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    location: { lat: 19.0176, lng: 72.8478 }, // Mumbai
    details: {
      description: 'Initial reports of a gas leak have been investigated.',
      sourceOfTruth: 'Verified by Mahanagar Gas Ltd: No leak detected.'
    },
  },
  {
    id: 'rumor-3',
    title: 'Power outage in Velachery',
    state: RumorState.Confirmed,
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    location: { lat: 12.9806, lng: 80.2212 }, // Chennai
    details: {
      description: 'Widespread power outage confirmed.',
      sourceOfTruth: 'Verified by TNEB.'
    },
  },
    {
    id: 'rumor-4',
    title: 'Traffic jam on Delhi-Gurgaon Expressway',
    state: RumorState.Investigating,
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    location: { lat: 28.5004, lng: 77.0708 }, // Delhi
    details: {
      description: 'Multiple reports of a severe traffic jam. Checking traffic cameras.',
    },
  },
];

export const DUMMY_OFFICIAL_ALERTS: OfficialAlert[] = [
    {
        id: 'alert-1',
        source: 'IMD',
        title: 'Cyclone Warning for Coastal Tamil Nadu',
        description: 'A severe cyclonic storm is expected to make landfall between Chennai and Puducherry within the next 24 hours. Heavy rainfall and strong winds are predicted.',
        severity: 'Red Alert',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        affectedArea: 'Coastal Districts of Tamil Nadu'
    },
    {
        id: 'alert-2',
        source: 'CWC',
        title: 'Yamuna River Flood Watch',
        description: 'The Yamuna river in Delhi is flowing above the danger mark. Low-lying areas are at high risk of inundation.',
        severity: 'Danger Level',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        affectedArea: 'Delhi NCR'
    },
    {
        id: 'alert-3',
        source: 'NCS',
        title: 'Minor Earthquake in Uttarakhand',
        description: 'A minor earthquake of magnitude 3.5 was reported in the Pithoragarh district. No major damage reported so far.',
        severity: 'Warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        affectedArea: 'Pithoragarh, Uttarakhand'
    },
];
