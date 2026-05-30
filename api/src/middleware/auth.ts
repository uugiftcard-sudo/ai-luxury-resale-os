import type { Request, Response, NextFunction } from 'express';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

export interface AuthTokenPayload {
  sub: string;
  role: 'buyer' | 'admin';
  email: string;
}

export interface AuthenticatedRequest extends Request {
  auth?: AuthTokenPayload;
}

function getJwtSecret(): Secret {
  const secret = process.env.CLOTH_JWT_SECRET;
  if (!secret || secret.trim() === '') {
    throw new Error('CLOTH_JWT_SECRET is not set');
  }
  return secret;
}

export function signAuthToken(payload: AuthTokenPayload, expiresIn: string = '7d'): string {
  const options: SignOptions = { expiresIn: expiresIn as unknown as SignOptions['expiresIn'] };
  return jwt.sign(payload, getJwtSecret(), options);
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const header = req.header('Authorization');
    if (!header) {
      res.status(401).json({ success: false, error: '缺少 Authorization' });
      return;
    }

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      res.status(401).json({ success: false, error: 'Authorization 格式应为 Bearer <token>' });
      return;
    }

    const decoded = jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
    req.auth = decoded;
    next();
  } catch (_err) {
    res.status(401).json({ success: false, error: '无效或过期 token' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!req.auth || req.auth.role !== 'admin') {
      res.status(403).json({ success: false, error: '需要管理员权限' });
      return;
    }
    next();
  });
}
