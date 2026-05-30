import { Router } from 'express';
import bcrypt from 'bcryptjs';

import { ok, fail, serverError } from '../middleware/response';
import { requireAuth, signAuthToken, type AuthenticatedRequest } from '../middleware/auth';
import { findUserByEmail, findUserById, saveUser, type User } from '../models/user';
import { generateId } from '../models/store';

const router = Router();

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  if (email.length < 3 || !email.includes('@')) return null;
  return email;
}

function normalizePassword(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const password = raw;
  if (password.length < 8) return null;
  return password;
}

function normalizeName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const name = raw.trim();
  if (name.length < 1) return null;
  return name;
}

router.post('/register', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = normalizePassword(req.body?.password);
    const name = normalizeName(req.body?.name);

    if (!email) return fail(res, 400, '邮箱格式不正确');
    if (!password) return fail(res, 400, '密码至少 8 位');
    if (!name) return fail(res, 400, '请输入姓名');

    const existing = findUserByEmail(email);
    if (existing) return fail(res, 409, '该邮箱已注册');

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const user: User = {
      id: generateId('u'),
      email,
      passwordHash,
      name,
      addresses: [],
      role: 'buyer',
      createdAt: now,
    };

    const saved = saveUser(user);
    const token = signAuthToken({ sub: saved.id, role: saved.role, email: saved.email });

    ok(res, {
      token,
      user: {
        id: saved.id,
        email: saved.email,
        name: saved.name,
        phone: saved.phone,
        addresses: saved.addresses,
        role: saved.role,
        createdAt: saved.createdAt,
      },
    }, '注册成功');
  } catch (err) {
    serverError(res, err);
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : null;

    if (!email) return fail(res, 400, '邮箱格式不正确');
    if (!password) return fail(res, 400, '请输入密码');

    const user = findUserByEmail(email);
    if (!user) return fail(res, 401, '邮箱或密码错误');

    const okPassword = await bcrypt.compare(password, user.passwordHash);
    if (!okPassword) return fail(res, 401, '邮箱或密码错误');

    const token = signAuthToken({ sub: user.id, role: user.role, email: user.email });

    ok(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        addresses: user.addresses,
        role: user.role,
        createdAt: user.createdAt,
      },
    }, '登录成功');
  } catch (err) {
    serverError(res, err);
  }
});

router.post('/logout', (_req, res) => {
  ok(res, { success: true }, '已退出登录');
});

router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth?.sub;
    if (!userId) return fail(res, 401, '未登录');

    const user = findUserById(userId);
    if (!user) return fail(res, 401, '用户不存在');

    ok(res, {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      addresses: user.addresses,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    serverError(res, err);
  }
});

router.put('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth?.sub;
    if (!userId) return fail(res, 401, '未登录');

    const user = findUserById(userId);
    if (!user) return fail(res, 401, '用户不存在');

    const name = req.body?.name !== undefined ? normalizeName(req.body.name) : undefined;
    if (name === null) return fail(res, 400, 'name 不能为空');

    const phone = req.body?.phone !== undefined
      ? (typeof req.body.phone === 'string' ? req.body.phone.trim() : null)
      : undefined;
    if (phone === null) return fail(res, 400, 'phone 必须是字符串');

    const addresses = req.body?.addresses !== undefined
      ? (Array.isArray(req.body.addresses) ? req.body.addresses : null)
      : undefined;
    if (addresses === null) return fail(res, 400, 'addresses 必须是数组');

    const updated = saveUser({
      ...user,
      name: name ?? user.name,
      phone: phone ?? user.phone,
      addresses: addresses ?? user.addresses,
      updatedAt: new Date().toISOString(),
    });

    ok(res, {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      addresses: updated.addresses,
      role: updated.role,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    }, '资料已更新');
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
