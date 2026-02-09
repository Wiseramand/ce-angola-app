
export type Gender = 'Male' | 'Female';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  gender: Gender;
  profilePicture?: string;
  hasLiveAccess: boolean;
  role: 'admin' | 'user';
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  text: string;
  timestamp: Date;
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
