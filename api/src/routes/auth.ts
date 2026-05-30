import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { ok, fail, serverError, validateRequired } from '../middleware/response';
import type { User } from '../models/user';
import { createUser, getUserByEmail, getUserById, updateUser } from '../models/users';
import { hashPassword, verifyPassword } from '../middleware/password';
import { requireAuth, signToken } from '../middleware/auth';

const router = Router();

function publicUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    addresses: u.addresses,
    role: u.role,
    createdAt: u.createdAt,
  };
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    if (!validateRequired(req, res, ['email', 'password', 'name'])) return;

    const email = String(req.body.email).trim().toLowerCase();
    const password = String(req.body.password);
    const name = String(req.body.name).trim();

    if (!email.includes('@')) {
      fail(res, 400, '邮箱格式不正确');
      return;
    }
    if (password.length < 6) {
      fail(res, 400, '密码至少 6 位');
      return;
    }
    if (name.length < 1) {
      fail(res, 400, '姓名不能为空');
      return;
    }

    if (getUserByEmail(email)) {
      fail(res, 409, '邮箱已注册');
      return;
    }

    const passwordHash = await hashPassword(password);

    const user: User = {
      id: uuid(),
      email,
      passwordHash,
      name,
      addresses: [],
      role: 'buyer',
      createdAt: new Date().toISOString(),
    };

    createUser(user);

    const token = signToken(user.id, user.role);
    ok(res, { token, user: publicUser(user) }, '注册成功');
  } catch (err) {
    serverError(res, err);
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    if (!validateRequired(req, res, ['email', 'password'])) return;

    const email = String(req.body.email).trim().toLowerCase();
    const password = String(req.body.password);

    const user = getUserByEmail(email);
    if (!user) {
      fail(res, 401, '邮箱或密码错误');
      return;
    }

    const okPass = await verifyPassword(password, user.passwordHash);
    if (!okPass) {
      fail(res, 401, '邮箱或密码错误');
      return;
    }

    const token = signToken(user.id, user.role);
    ok(res, { token, user: publicUser(user) }, '登录成功');
  } catch (err) {
    serverError(res, err);
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  ok(res, { ok: true }, '已退出');
});

router.get('/me', requireAuth, (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      fail(res, 401, '未登录');
      return;
    }

    const user = getUserById(userId);
    if (!user) {
      fail(res, 404, '用户不存在');
      return;
    }

    ok(res, publicUser(user));
  } catch (err) {
    serverError(res, err);
  }
});

router.put('/me', requireAuth, (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      fail(res, 401, '未登录');
      return;
    }

    const patch = {
      name: typeof req.body.name === 'string' ? req.body.name.trim() : undefined,
      phone: typeof req.body.phone === 'string' ? req.body.phone.trim() : undefined,
      addresses: Array.isArray(req.body.addresses) ? req.body.addresses : undefined,
    };

    if (patch.name !== undefined && patch.name.length < 1) {
      fail(res, 400, '姓名不能为空');
      return;
    }

    const updated = updateUser(userId, patch);
    if (!updated) {
      fail(res, 404, '用户不存在');
      return;
    }

    ok(res, publicUser(updated), '更新成功');
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
