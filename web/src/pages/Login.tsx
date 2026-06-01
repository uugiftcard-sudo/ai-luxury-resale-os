/**
 * Login page — stub UI with AuthContext integration
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMarket } from '../hooks/useMarket';
import { useToast } from '../hooks/useToast';

export default function Login() {
  const { login } = useAuth();
  const { market } = useMarket();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const prefix = market === 'UK' ? '' : `/${market.toLowerCase()}`;
  const isEn = market === 'UK';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast(isEn ? 'Welcome back!' : '歡迎回來！', 'success');
      navigate(prefix || '/');
    } catch {
      showToast(isEn ? 'Login failed. Please try again.' : '登入失敗，請重試', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '2rem', background: 'var(--color-surface)', borderRadius: 12, boxShadow: 'var(--shadow-md)' }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>{isEn ? 'Sign In' : '登入'}</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {isEn ? "Don't have an account? " : '還沒有帳號？'}
          <Link to={`${prefix}/register`} style={{ color: 'var(--color-accent)' }}>
            {isEn ? 'Register' : '立即註冊'}
          </Link>
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
              {isEn ? 'Email' : '電郵地址'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={isEn ? 'you@example.com' : '請輸入電郵地址'}
              style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
              {isEn ? 'Password' : '密碼'}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isEn ? 'Enter password' : '請輸入密碼'}
              style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? (isEn ? 'Signing in…' : '登入中…') : (isEn ? 'Sign In' : '登入')}
          </button>
        </form>
      </div>
    </div>
  );
}
