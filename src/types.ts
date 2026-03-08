
export type Gender = 'Male' | 'Female';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  neighborhood?: string;
  address: string;
  gender: Gender;
  profilePicture?: string;
  hasLiveAccess: boolean;
  role: UserRole | string;
}

export interface StreamEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  thumbnailUrl: string;
  isLive: boolean;
  viewers: number;
  type: 'public' | 'private';
  streamSource: 'youtube' | 'facebook' | 'custom' | string;
  streamUrl: string;
}

export interface ProgramCredential {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  expiresAt?: string;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  text: string;
  channel: string;
  timestamp: string;
}

export interface StreamConfig {
  publicUrl: string;
  publicTitle: string;
  publicDescription: string;
  privateUrl: string;
  privateTitle: string;
  privateDescription: string;
  isPrivateMode: boolean;
}

export interface PartnershipBranch {
  id: string;
  name: string;
  description: string;
  impact: string;
  imageUrl: string;
}

export interface DonationRecord {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  description: string;
  method: string;
  date: Date;
  type: 'Donation' | 'Sponsorship';
}
