import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Braces, LockKeyhole, LogIn, ShieldCheck, UserRound } from 'lucide-react';
import { getPostLoginRoute } from './access';
import { useAuthStore } from './authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const { error, loading, login } = useAuthStore();
  const [form, setForm] = useState({ username: '', password: '' });
  const [localError, setLocalError] = useState('');

  async function submit(event) {
    event.preventDefault();
    const username = form.username.trim();
    const password = form.password;
    if (!username || !password) {
      setLocalError('Username dan password wajib diisi.');
      return;
    }

    setLocalError('');
    const payload = await login({ username, password }).catch(() => null);
    if (payload?.user) navigate(getPostLoginRoute(payload.user), { replace: true });
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    if (localError) setLocalError('');
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-copy-panel">
          <div className="auth-brand compact-brand">
            <span><Braces size={22} /></span>
            <div>
              <strong>Intent & Agent</strong>
              <small>Management Console</small>
            </div>
          </div>
          <div className="auth-copy">
            <span className="auth-badge"><ShieldCheck size={15} /> Protected workspace</span>
            <h1>Masuk ke dashboard</h1>
            <p>Gunakan akun yang sudah diberikan admin untuk masuk ke dashboard konfigurasi.</p>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-form-head">
            <span><LockKeyhole size={20} /></span>
            <div>
              <p className="eyebrow">Secure Access</p>
              <h2>Masuk</h2>
            </div>
          </div>

          <form className="auth-form" onSubmit={submit} noValidate>
            {(localError || error) && <div className="error-box"><p>{localError || error}</p></div>}

            <label>
              <span>Username</span>
              <div className="auth-input-shell">
                <UserRound size={17} />
                <input
                  autoFocus
                  autoComplete="username"
                  value={form.username}
                  onChange={(event) => updateField('username', event.target.value)}
                  placeholder="Masukkan username"
                  disabled={loading}
                />
              </div>
            </label>

            <label>
              <span>Password</span>
              <div className="auth-input-shell">
                <LockKeyhole size={17} />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  placeholder="Masukkan password"
                  disabled={loading}
                />
              </div>
            </label>

            <button className="primary-button" type="submit" disabled={loading}>
              <LogIn size={17} />
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="auth-footnote">
            <ShieldCheck size={15} />
        <span>Session tersimpan setelah login.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
