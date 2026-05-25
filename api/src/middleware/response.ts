/**
 * 验证中间件
 * 提供请求参数验证和错误处理
 */
import { NextFunction, Request, Response } from 'express';

/**
 * 统一响应格式
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 成功响应
 */
export function ok<T>(res: Response, data: T, message?: string): void {
  res.json({
    success: true,
    data,
    message: message || '操作成功',
  });
}

/**
 * 错误响应
 */
export function fail(res: Response, status: number, message: string): void {
  res.status(status).json({
    success: false,
    error: message,
  });
}

/**
 * 验证必填字段
 */
export function validateRequired(
  req: Request,
  res: Response,
  fields: string[]
): boolean {
  for (const field of fields) {
    if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
      fail(res, 400, `缺少必填字段: ${field}`);
      return false;
    }
  }
  return true;
}

/**
 * 验证数字字段
 */
export function validateNumber(
  value: unknown,
  _fieldName: string
): number | null {
  const num = Number(value);
  if (isNaN(num) || num < 0) {
    return null;
  }
  return num;
}

/**
 * 404 处理
 */
export function notFound(res: Response, resource: string = '资源'): void {
  fail(res, 404, `${resource}不存在`);
}

/**
 * 500 处理 — structured JSON error，唔爆 stack trace
 */
export function serverError(res: Response, err: unknown): void {
  console.error('服务器错误:', err);
  fail(res, 500, '服务器内部错误');
}

/**
 * Express 全局错误处理，确保 parser / route errors 不回 HTML 或 stack trace。
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (res.headersSent) return;

  const status = typeof err === 'object' && err !== null && 'status' in err
    ? Number((err as { status?: unknown }).status) || 500
    : 500;

  if (status === 400) {
    fail(res, 400, '请求 JSON 格式错误');
    return;
  }

  serverError(res, err);
}
