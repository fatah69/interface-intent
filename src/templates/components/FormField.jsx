import { FileJson } from 'lucide-react';
import { labelFor } from '../../utils/resourceUtils.jsx';

export function FormField({ field, value, data, error, onChange, onFormat }) {
  const wide = field.type === 'textarea' || field.type === 'json';
  return (
    <label className={wide ? 'wide' : ''}>
      <span>{field.label}</span>
      <Field field={field} value={value} data={data} onChange={onChange} />
      {field.type === 'json' && (
        <div className="field-actions">
          <button type="button" className="text-button" onClick={onFormat} disabled={Boolean(error)}>
            <FileJson size={14} /> Format JSON
          </button>
          <span className={error ? 'field-error' : 'field-valid'}>{error || 'JSON valid'}</span>
        </div>
      )}
    </label>
  );
}

function Field({ field, value, data, onChange }) {
  if (field.type === 'select') {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select option</option>
        {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    );
  }

  if (field.type === 'relation') {
    return (
      <select value={value ?? ''} onChange={(event) => onChange(event.target.value)}>
        <option value="">None</option>
        {(data[field.resource] || []).map((item) => (
          <option key={item.id ?? item.uuid} value={item.id ?? item.uuid}>{labelFor(field.resource, item.id ?? item.uuid, data)}</option>
        ))}
      </select>
    );
  }

  if (field.type === 'textarea' || field.type === 'json') {
    return <textarea rows={field.type === 'json' ? 5 : 3} value={value} placeholder={field.placeholder || ''} onChange={(event) => onChange(event.target.value)} />;
  }

  return <input value={value} placeholder={field.placeholder || ''} onChange={(event) => onChange(event.target.value)} />;
}
