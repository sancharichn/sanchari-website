
export enum UserRole {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN'
}

export enum Relation {
  SPOUSE = 'Spouse',
  CHILD = 'Child',
  PARENT = 'Parent',
  OTHER = 'Other'
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: Relation;
  age: number;
  bloodGroup: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string; // Optional for security handling in this demo
  bloodGroup: string;
  dob: string;
  birthday: string; // ISO format date string
  location: string;
  familyMembers: FamilyMember[];
}

export interface TravelEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  capacity: number;
  deadline: string;
  status: 'draft' | 'published' | 'completed';
  image?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  memberId: string;
  attendingFamilyIds: string[]; // IDs of family members joining
  specialRequests: string;
  timestamp: string;
}

export interface MOMData {
  eventId: string;
  agenda: string;
  discussions: string;
  actionItems: string;
  nextSteps: string;
}

export interface SavedMOM {
  id: string;
  eventId: string;
  eventTitle: string;
  content: string;
  timestamp: string;
}
