export enum UserRole {
  GUEST = 'GUEST',
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface ProgramCredential {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  expiresAt: string; // ISO Date string
  createdAt: string;
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
  streamSource: 'youtube' | 'custom';
  streamUrl: string;
}

export interface Devotional {
  title: string;
  scripture: string;
  content: string;
}

export interface PartnershipArm {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}