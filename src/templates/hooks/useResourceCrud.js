import { useMemo, useState } from 'react';
import { api } from '../../api/client';
import { modules } from '../../config/resources';
import { actionTargetFields } from '../../config/resourceOptions';
import {
  emptyRecord,
  normalizeRecord,
  preparePayload,
  validateRecord,
  visibleFields,
} from '../../utils/resourceUtils.jsx';

export function useResourceCrud({ resource, data, loadData, setApiStatus }) {
  const config = modules[resource];
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  const capabilities = {
    canRead: api.can(resource, 'read'),
    canCreate: api.can(resource, 'create'),
    canUpdate: api.can(resource, 'update'),
    canRemove: api.can(resource, 'remove'),
  };
  const rows = data[resource] || [];

  const filteredRows = useMemo(() => {
    const needle = query.toLowerCase();
    return rows.filter((row) => Object.values(row).join(' ').toLowerCase().includes(needle));
  }, [query, rows]);

  function updateFormField(field, value) {
    setForm((current) => {
      const next = { ...current, [field.key]: value };
      if (resource === 'actions' && field.key === 'action_type') {
        actionTargetFields.forEach((targetField) => {
          next[targetField] = '';
        });
      }
      if (resource === 'actions' && actionTargetFields.includes(field.key)) {
        actionTargetFields.forEach((targetField) => {
          if (targetField !== field.key) next[targetField] = '';
        });
      }
      return next;
    });
  }

  function formatJsonField(field) {
    setForm((current) => {
      try {
        return { ...current, [field.key]: JSON.stringify(JSON.parse(current[field.key] || '{}'), null, 2) };
      } catch {
        return current;
      }
    });
  }

  function openCreate() {
    if (!capabilities.canCreate) return;
    setModal({ mode: 'create', resource });
    setForm(emptyRecord(config.fields));
    setErrors([]);
  }

  async function getDetailOrRow(row) {
    if (!api.can(resource, 'detail')) return row;
    try {
      return normalizeRecord(await api.detail(resource, row.id));
    } catch {
      setApiStatus(`Endpoint detail ${config.singular} gagal, memakai data dari list.`);
      return row;
    }
  }

  async function openEdit(row) {
    if (!capabilities.canUpdate) return;
    setErrors([]);
    setBusy(true);
    try {
      const detail = await getDetailOrRow(row);
      setModal({ mode: 'edit', resource, id: row.id });
      setForm({ ...emptyRecord(config.fields), ...row, ...detail });
    } catch (error) {
      setErrors([`Gagal membuka form edit: ${error.message || 'request gagal'}.`]);
    } finally {
      setBusy(false);
    }
  }

  async function openDrawer(row) {
    setErrors([]);
    setBusy(true);
    try {
      const detail = await getDetailOrRow(row);
      setDrawer({ resource, row: { ...row, ...detail } });
    } catch (error) {
      setDrawer({ resource, row });
    } finally {
      setBusy(false);
    }
  }

  async function saveForm(event) {
    event.preventDefault();
    const nextErrors = validateRecord(resource, form);
    if (nextErrors.length) {
      setErrors(nextErrors);
      return;
    }

    const payload = preparePayload(resource, form);
    try {
      if (modal.mode === 'create') await api.create(resource, payload);
      if (modal.mode === 'edit') await api.update(resource, modal.id, payload);
      setApiStatus('Perubahan berhasil dikirim ke API.');
      await loadData();
    } catch (error) {
      setErrors([`Gagal menyimpan ke API: ${error.message || 'request gagal'}.`]);
      setApiStatus('Perubahan tidak disimpan karena API gagal merespons.');
      return;
    }
    setModal(null);
  }

  async function deleteRow(row) {
    if (!capabilities.canRemove) return;
    if (!window.confirm(`Hapus ${config.singular} #${row.id}?`)) return;
    try {
      await api.remove(resource, row.id);
      await loadData();
      setApiStatus('Data berhasil dihapus dari API.');
    } catch (error) {
      setErrors([`Gagal menghapus dari API: ${error.message || 'request gagal'}.`]);
      setApiStatus('Data tidak dihapus karena API gagal merespons.');
    }
  }

  const visibleFormFields = modal ? visibleFields(modal.resource, modules[modal.resource].fields, form) : [];

  return {
    busy,
    capabilities,
    config,
    drawer,
    errors,
    filteredRows,
    form,
    modal,
    query,
    deleteRow,
    formatJsonField,
    openCreate,
    openDrawer,
    openEdit,
    saveForm,
    setDrawer,
    setModal,
    setQuery,
    updateFormField,
    visibleFormFields,
  };
}
