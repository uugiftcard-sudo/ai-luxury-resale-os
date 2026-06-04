/**
 * Register page — stub UI
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMarket } from '../hooks/useMarket';
import { useToast } from '../hooks/useToast';

export default function Register() {
  const { login } = useAuth();
  const { market } = useMarket();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const prefix = market === 'UK' ? '' : `/${market.toLowerCase()}`;
  const isEn = market === 'UK';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Stub: just log in directly after "registration"
      await login(email, password);
      showToast(isEn ? `Welcome, ${name}!` : `歡迎，${name}！`, 'success');
      navigate(prefix || '/');
    } catch {
      showToast(isEn ? 'Registration failed. Please try again.' : '註冊失敗，請重試', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '2rem', background: 'var(--color-surface)', borderRadius: 12, boxShadow: 'var(--shadow-md)' }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>{isEn ? 'Create Account' : '建立帳號'}</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {isEn ? 'Already have an account? ' : '已有帳號？'}
          <Link to={`${prefix}/login`} style={{ color: 'var(--color-accent)' }}>
            {isEn ? 'Sign in' : '立即登入'}
          </Link>
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>
              {isEn ? 'Name' : '姓名'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={isEn ? 'Your name' : '請輸入姓名'}
              style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isEn ? 'Min. 6 characters' : '最少 6 個字元'}
              style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? (isEn ? 'Creating…' : '建立中…') : (isEn ? 'Create Account' : '建立帳號')}
          </button>
        </form>
      </div>
    </div>
  );
}
