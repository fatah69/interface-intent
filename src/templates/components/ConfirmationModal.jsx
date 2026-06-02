import { AlertTriangle } from 'lucide-react';

export function ConfirmationModal({ confirmation, onCancel, onConfirm }) {
  if (!confirmation) return null;

  return (
    <div className="modal-backdrop confirmation-backdrop" role="presentation">
      <div className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
        <div className="confirmation-icon">
          <AlertTriangle size={22} />
        </div>
        <div className="confirmation-copy">
          <p className="eyebrow">Confirmation</p>
          <h2 id="confirmation-title">{confirmation.title}</h2>
          <p>{confirmation.message}</p>
        </div>
        <div className="confirmation-actions">
          <button type="button" className="secondary-button" onClick={onCancel} disabled={confirmation.busy}>
            Cancel
          </button>
          <button type="button" className="primary-button danger-button" onClick={onConfirm} disabled={confirmation.busy}>
            {confirmation.busy ? 'Deleting...' : confirmation.confirmLabel || 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
