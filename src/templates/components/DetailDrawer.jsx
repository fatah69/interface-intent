import { X } from 'lucide-react';
import { api, endpoints } from '../../api/client';
import { modules } from '../../config/resources';
import { getActionTarget } from '../../utils/resourceUtils.jsx';

export function DetailDrawer({ drawer, data, onClose, onEdit }) {
  if (!drawer) return null;

  const config = modules[drawer.resource];
  const row = drawer.row;
  const canUpdate = api.can(drawer.resource, 'update');
  const detailEndpoint = endpoints[drawer.resource]?.detail ? `${endpoints[drawer.resource].path}${row.id}` : 'Not available';

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
          <div><dt>Detail endpoint</dt><dd><code>{detailEndpoint}</code></dd></div>
          <div><dt>Can update</dt><dd>{canUpdate ? 'Yes' : 'No'}</dd></div>
          <div><dt>Can delete</dt><dd>{api.can(drawer.resource, 'remove') ? 'Yes' : 'No'}</dd></div>
        </dl>

        <pre className="payload-view">{JSON.stringify(row, null, 2)}</pre>

        <div className="drawer-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Close</button>
          <button type="button" className="primary-button" disabled={!canUpdate} onClick={() => onEdit(row)}>Edit</button>
        </div>
      </section>
    </aside>
  );
}
