import { createSqliteCollection } from '../db';
import type { Address, User } from './user';

interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: 'buyer' | 'admin';
  createdAt: string;
  addressesJson: string;
}

function safeParseAddresses(json: string): Address[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toRecord(u: User): UserRecord {
  return {
    id: u.id,
    email: u.email,
    passwordHash: u.passwordHash,
    name: u.name,
    phone: u.phone,
    role: u.role,
    createdAt: u.createdAt,
    addressesJson: JSON.stringify(u.addresses ?? []),
  };
}

function fromRecord(r: UserRecord): User {
  return {
    id: r.id,
    email: r.email,
    passwordHash: r.passwordHash,
    name: r.name,
    phone: r.phone,
    addresses: safeParseAddresses(r.addressesJson),
    role: r.role,
    createdAt: r.createdAt,
  };
}

const users = createSqliteCollection<UserRecord>('users', 'id', (u) => u.id, []);

export function getUserByEmail(email: string): User | null {
  const row = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return row ? fromRecord(row) : null;
}

export function getUserById(id: string): User | null {
  const row = users.find((u) => u.id === id);
  return row ? fromRecord(row) : null;
}

export function createUser(user: User): User {
  users.upsert(toRecord(user));
  return user;
}

export function updateUser(
  id: string,
  patch: Partial<Omit<User, 'id' | 'email' | 'passwordHash' | 'createdAt'>>
): User | null {
  const existing = getUserById(id);
  if (!existing) return null;

  const updated: User = {
    ...existing,
    ...patch,
    addresses: patch.addresses ?? existing.addresses,
  };

  users.upsert(toRecord(updated));
  return updated;
}
