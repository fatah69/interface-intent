import { ArrowRight, LogOut, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routeByModule } from '../../config/resources';
import { getRoleName } from '../../features/auth/access';

export function ForbiddenState({ user, onLogout, title = '403 Access Forbidden', message = 'Akun ini tidak punya izin untuk membuka halaman tersebut.' }) {
  const navigate = useNavigate();
  const roleName = getRoleName(user) || `role #${user?.role_id || '-'}`;

  return (
    <section className="forbidden-state" aria-labelledby="forbidden-title">
      <div className="forbidden-icon">
        <ShieldAlert size={28} />
      </div>
      <div className="forbidden-copy">
        <p className="eyebrow">Restricted route</p>
        <h1 id="forbidden-title">{title}</h1>
        <p>{message}</p>
        <span className="forbidden-role">Role: {roleName}</span>
      </div>
      <div className="forbidden-actions">
        <button className="primary-button" type="button" onClick={() => navigate(routeByModule.intents, { replace: true })}>
          Open Main Menu
          <ArrowRight size={17} />
        </button>
        {onLogout && (
          <button className="secondary-button" type="button" onClick={onLogout}>
            <LogOut size={16} />
            Logout
          </button>
        )}
      </div>
    </section>
  );
}
