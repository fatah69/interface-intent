import { useMemo, useState } from 'react';
import { PageHeader, StatusStrip } from '../../templates/components/PageHeader';
import { ResourceCrudSurface } from '../../templates/components/ResourceCrudSurface';
import { useResourceCrud } from '../../templates/hooks/useResourceCrud';
import { itemLabel } from '../../utils/resourceUtils.jsx';

export function IntentsPage({ data, apiStatus, loading, loadData, setApiStatus }) {
  const [selectedUsecaseId, setSelectedUsecaseId] = useState('');
  const usecases = data.usecases || [];

  const filteredData = useMemo(() => {
    if (!selectedUsecaseId) return data;

    return {
      ...data,
      intents: (data.intents || []).filter((intent) => String(intent.usecase_id ?? intent.usecase?.id ?? '') === selectedUsecaseId),
    };
  }, [data, selectedUsecaseId]);

  const crud = useResourceCrud({ resource: 'intents', data: filteredData, loadData, setApiStatus });
  const statusWarning = apiStatus.includes('gagal') || apiStatus.includes('belum');

  return (
    <>
      <PageHeader
        config={crud.config}
        countLabel={crud.filteredRows.length + ' records'}
        onRefresh={loadData}
        actions={(
          <label className="topbar-filter" htmlFor="intent-usecase-filter">
            <span>Usecase</span>
            <select
              id="intent-usecase-filter"
              value={selectedUsecaseId}
              onChange={(event) => setSelectedUsecaseId(event.target.value)}
              disabled={loading || crud.busy || !usecases.length}
            >
              <option value="">All usecases</option>
              {usecases.map((usecase) => (
                <option key={usecase.id} value={String(usecase.id)}>{itemLabel('usecases', usecase, data)}</option>
              ))}
            </select>
          </label>
        )}
      />
      <StatusStrip warning={statusWarning}>{loading || crud.busy ? 'Memuat data...' : apiStatus}</StatusStrip>
      <ResourceCrudSurface resource="intents" data={filteredData} loading={loading} crud={crud} />
    </>
  );
}
