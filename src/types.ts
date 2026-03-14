import { LucideIcon } from 'lucide-react';

export enum UserRole {
  SUPER_ADMIN = 'SuperAdmin',
  ADMIN = 'Admin',
  STAFF = 'Staff',
  CUSTOMER = 'Customer',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Court {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  currentBooking?: {
    user: string;
    startTime: string; // ISO string
    endTime: string; // ISO string
    groupSize: number;
  };
  temperature: number;
  humidity: number;
  lights: boolean;
}

export interface Device {
  id: string;
  name: string;
  type: 'light' | 'ac' | 'fan' | 'camera' | 'door' | 'smoke' | 'utility';
  status: 'online' | 'offline' | 'warning';
  value: number | boolean; // e.g., brightness %, on/off, open/closed
  location: string;
  battery?: number;
}

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  view?: ViewState;
  children?: NavItem[];
}

export enum ViewState {
  DASHBOARD = 'dashboard',
  IOT = 'iot',
  RESERVATIONS = 'reservations',
  MEMBERS = 'members',
  RENTAL = 'rental',
  POS = 'pos',
  VENDING = 'vending',
  ANALYTICS = 'analytics',
  SETTINGS = 'settings',
}

export interface KPIMetric {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
}