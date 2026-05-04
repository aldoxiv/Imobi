import { Timestamp } from './lib/firebase';

export type UserRole = 'client' | 'agent' | 'admin';

export interface UserProfile {
  id: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: UserRole;
  favorites: string[];
}

export type PropertyCategory = 'buy' | 'rent';
export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial';
export type PropertyStatus = 'active' | 'sold' | 'rented';

export interface PropertyAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: PropertyCategory;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  address: PropertyAddress;
  images: string[];
  features: string[];
  agentId: string;
  createdAt: Timestamp;
  status: PropertyStatus;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  userId: string;
  agentId: string;
  message: string;
  phone: string;
  timestamp: Timestamp;
  status: 'new' | 'contacted' | 'closed';
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  agentId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
