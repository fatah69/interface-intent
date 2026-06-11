import { LogOut, RefreshCw, ShieldAlert } from 'lucide-react';

export function AssignmentRequiredState({ user, onLogout, onRefresh, refreshing = false }) {
  return (
    <section className="assignment-shell" aria-labelledby="assignment-title">
      <div className="assignment-card">
        <div className="assignment-card-head">
          <div className="assignment-icon"><ShieldAlert size={24} /></div>
          <div>
            <p className="eyebrow">Akses akun</p>
            <h1 id="assignment-title">Akses belum aktif</h1>
            <p>Akun kamu belum terhubung ke usecase. Hubungi admin untuk mengaktifkan akses.</p>
          </div>
        </div>

        <div className="assignment-meta-grid">
          <div className="assignment-meta-item">
            <span>Akun</span>
            <strong>{user?.username || 'employee'}</strong>
          </div>
          <div className="assignment-meta-item">
            <span>Status</span>
            <strong>Menunggu akses admin</strong>
          </div>
        </div>

        <div className="assignment-actions">
          <button className="primary-button" type="button" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw size={16} />
            {refreshing ? 'Memeriksa...' : 'Cek Akses'}
          </button>
          <button className="secondary-button" type="button" onClick={onLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </section>
  );
}
