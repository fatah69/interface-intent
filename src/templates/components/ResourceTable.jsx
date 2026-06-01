import { Boxes, Eye, Pencil, Trash2 } from 'lucide-react';
import { renderValue } from '../../utils/resourceUtils.jsx';

export function ResourceTable({ resource, config, data, rows, canUpdate, canRemove, onView, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table className={`resource-table resource-${resource}`}>
        <thead>
          <tr>
            {config.columns.map((column) => <th key={column} className={`col-${column}`}>{column.replaceAll('_', ' ')}</th>)}
            <th className="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id ?? row.uuid} className="clickable-row" onClick={() => onView(row)}>
              {config.columns.map((column) => (
                <td key={column} className={`cell-${column}`}>{renderValue(resource, row, column, data)}</td>
              ))}
              <td className="row-actions" onClick={(event) => event.stopPropagation()}>
                <button className="ghost-button" onClick={() => onView(row)} title="View details">
                  <Eye size={16} />
                </button>
                <button className="ghost-button" onClick={() => onEdit(row)} title={canUpdate ? 'Edit' : 'Endpoint update belum tersedia'} disabled={!canUpdate}>
                  <Pencil size={16} />
                </button>
                <button className="ghost-button danger" onClick={() => onDelete(row)} title={canRemove ? 'Delete' : 'Endpoint delete belum tersedia'} disabled={!canRemove}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={config.columns.length + 1} className="empty-state">
                <Boxes size={28} />
                Tidak ada data untuk filter ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
