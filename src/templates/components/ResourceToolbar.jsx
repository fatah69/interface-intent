import { Plus, Search } from 'lucide-react';

export function ResourceToolbar({ config, query, onQueryChange, onCreate, disabled = false, canCreate = false, children }) {
  return (
    <div className="panel-toolbar">
      <div className="search-box">
        <Search size={18} />
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}`} />
      </div>
      {children || (
        <button className="primary-button" onClick={onCreate} disabled={disabled || !canCreate} title={canCreate ? `Add ${config.singular}` : 'Endpoint create belum tersedia'}>
          <Plus size={18} />
          {canCreate ? `Add ${config.singular}` : 'Create unavailable'}
        </button>
      )}
    </div>
  );
}
