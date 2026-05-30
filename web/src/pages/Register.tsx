import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { useMarket } from '../hooks/useMarket';
import styles from './Register.module.css';

function marketPath(market: string, path: string): string {
  const prefix = market === 'UK' ? '' : `/${market.toLowerCase()}`;
  if (path === '/') return prefix || '/';
  return `${prefix}${path}`;
}

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const { market } = useMarket();
  const nav = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      showToast('请填写姓名、邮箱和密码', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await register(email.trim(), password, name.trim());
      showToast('注册成功', 'success');
      const redirect = (location.state as { from?: string } | null)?.from;
      nav(redirect || marketPath(market, '/'));
    } catch (err) {
      showToast(err instanceof Error ? err.message : '注册失败', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>注册</h1>
        <p className={styles.subtitle}>创建一个 CLOTH 账号</p>

        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.label}>
            姓名
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="你的称呼"
              autoComplete="name"
            />
          </label>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 8 位"
            />
          </label>

          <button className={styles.primary} type="submit" disabled={submitting}>
            {submitting ? '提交中…' : '注册'}
          </button>
        </form>

        <div className={styles.footer}>
          <span>已有账号？</span>
          <Link to={marketPath(market, '/login')} className={styles.link}>去登录</Link>
        </div>
      </div>
    </div>
  );
}
