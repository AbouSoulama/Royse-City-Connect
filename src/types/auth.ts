import type { UserRole } from './database';

export interface AuthUser {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  role: UserRole;
  guest?: boolean;
  avatarUrl?: string;
  bio?: string;
  memberSince?: string;
}
