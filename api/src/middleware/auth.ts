import jwt, { SignOptions } from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { fail } from './response';

export type UserRole = 'buyer' | 'admin';

interface JwtPayload {
  sub: string;
  role: UserRole;
}

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(userId: string, role: UserRole): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as unknown as SignOptions['expiresIn'] };
  return jwt.sign({ sub: userId, role } satisfies JwtPayload, JWT_SECRET, options);
}

function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (typeof decoded !== 'object' || decoded === null) throw new Error('Invalid token');

  const payload = decoded as Partial<JwtPayload>;
  if (!payload.sub || !payload.role) throw new Error('Invalid token payload');
  return { sub: payload.sub, role: payload.role };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRole;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    fail(res, 401, '未登录');
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    fail(res, 401, '登录已过期');
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.userId) {
    fail(res, 401, '未登录');
    return;
  }
  if (req.userRole !== 'admin') {
    fail(res, 403, '无权限');
    return;
  }
  next();
}

export { signToken };
