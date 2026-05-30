import { createSqliteCollection } from '../db';

export type UserRole = 'buyer' | 'admin';

export interface Address {
  id: string;
  label?: string;
  recipientName?: string;
  phone?: string;
  line1: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  addresses: Address[];
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

const seedUsers: User[] = [];

const userCollection = createSqliteCollection<User>(
  'users',
  'id',
  (user) => user.id,
  seedUsers
);

export function findUserById(id: string): User | undefined {
  return userCollection.find((u) => u.id === id);
}

export function findUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase();
  return userCollection.find((u) => u.email.toLowerCase() === normalized);
}

export function listUsers(): User[] {
  return userCollection.findAll();
}

export function saveUser(user: User): User {
  return userCollection.upsert(user);
}
