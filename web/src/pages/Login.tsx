import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { useMarket } from '../hooks/useMarket';
import styles from './Login.module.css';

function marketPath(market: string, path: string): string {
  const prefix = market === 'UK' ? '' : `/${market.toLowerCase()}`;
  if (path === '/') return prefix || '/';
  return `${prefix}${path}`;
}

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const { market } = useMarket();
  const nav = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('请填写邮箱和密码', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      showToast('登录成功', 'success');
      const redirect = (location.state as { from?: string } | null)?.from;
      nav(redirect || marketPath(market, '/'));
    } catch (err) {
      showToast(err instanceof Error ? err.message : '登录失败', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>登录</h1>
        <p className={styles.subtitle}>使用你的邮箱登录 CLOTH</p>

        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.label}>
            邮箱
            <input
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </label>

          <label className={styles.label}>
            密码
            <input
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 8 位"
            />
          </label>

          <button className={styles.primary} type="submit" disabled={submitting}>
            {submitting ? '提交中…' : '登录'}
          </button>
        </form>

        <div className={styles.footer}>
          <span>没有账号？</span>
          <Link to={marketPath(market, '/register')} className={styles.link}>去注册</Link>
        </div>
      </div>
    </div>
  );
}
