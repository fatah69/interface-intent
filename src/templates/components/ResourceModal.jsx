import { Info, X } from 'lucide-react';
import { modules } from '../../config/resources';
import { validateJson } from '../../utils/resourceUtils.jsx';
import { FormField } from './FormField';

export function ResourceModal({ modal, form, errors, visibleFields, data, onChangeField, onFormatJson, onClose, onSubmit }) {
  if (!modal) return null;
  const config = modules[modal.resource];

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal" onSubmit={onSubmit}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{modal.mode === 'create' ? 'Create' : 'Update'}</p>
            <h2>{config.singular}</h2>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {errors.length > 0 && (
          <div className="error-box">
            {errors.map((error) => <p key={error}>{error}</p>)}
          </div>
        )}

        {modal.resource === 'actions' && !form.action_type && (
          <div className="hint-box"><Info size={16} />Pilih Action Type dulu untuk menampilkan target yang relevan.</div>
        )}

        <div className="form-grid">
          {visibleFields.map((field) => (
            <FormField
              key={field.key}
              field={field}
              value={form[field.key] ?? ''}
              data={data}
              error={field.type === 'json' ? validateJson(form[field.key]) : ''}
              onChange={(value) => onChangeField(field, value)}
              onFormat={() => onFormatJson(field)}
            />
          ))}
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button">Save</button>
        </div>
      </form>
    </div>
  );
}
