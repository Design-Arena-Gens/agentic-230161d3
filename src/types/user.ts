import type { UserRole } from '@/models/User';

export type SafeUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  company?: string;
  skills: string[];
  experience?: string;
  preferredRole?: string;
  preferredLocation?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
