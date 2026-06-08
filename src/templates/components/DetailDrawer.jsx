import { X } from 'lucide-react';
import { api } from '../../api/client';
import { modules } from '../../config/resources';
import { getActionTarget } from '../../utils/resourceUtils.jsx';

function labelKey(key) {
  return key.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function readableValue(value) {
  if (value == null || value === '') return '-';
  if (Array.isArray(value)) {
    if (!value.length) return '-';
    return value.map((item) => readableValue(item)).join(', ');
  }
  if (typeof value === 'object') {
    return value.name || value.username || value.email || value.collection_name || value.agent_name || value.host || '-';
  }
  return String(value);
}

export function DetailDrawer({ drawer, data, onClose, onEdit }) {
  if (!drawer) return null;

  const config = modules[drawer.resource];
  const row = drawer.row;
  const canUpdate = api.can(drawer.resource, 'update');

  return (
    <aside className="drawer-backdrop">
      <section className="detail-drawer">
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Detail</p>
            <h2>{config.singular} #{row.id ?? row.uuid ?? '-'}</h2>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}><X size={18} /></button>
        </div>

        {drawer.resource === 'actions' && (
          <div className="detail-summary">
            <span className="badge">{row.action_type || '-'}</span>
            <strong>{getActionTarget(row, data).label}</strong>
          </div>
        )}

        <dl className="detail-list">
          <div><dt>Status data</dt><dd>{row.id || row.uuid ? 'Tersimpan' : 'Belum lengkap'}</dd></div>
          <div><dt>Ubah data</dt><dd>{canUpdate ? 'Bisa diubah' : 'Tidak bisa diubah'}</dd></div>
          <div><dt>Hapus data</dt><dd>{api.can(drawer.resource, 'remove') ? 'Bisa dihapus' : 'Tidak bisa dihapus'}</dd></div>
        </dl>

        <dl className="detail-list">
          {Object.entries(row)
            .filter(([key]) => key !== 'password')
            .map(([key, value]) => (
              <div key={key}><dt>{labelKey(key)}</dt><dd>{readableValue(value)}</dd></div>
            ))}
        </dl>

        <div className="drawer-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Tutup</button>
          <button type="button" className="primary-button" disabled={!canUpdate} onClick={() => onEdit(row)}>Ubah</button>
        </div>
      </section>
    </aside>
  );
}
