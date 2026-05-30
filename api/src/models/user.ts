export interface Address {
  id: string;
  label?: string;
  recipientName: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  addresses: Address[];
  role: 'buyer' | 'admin';
  createdAt: string;
}
