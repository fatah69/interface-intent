import { PageHeader, StatusStrip } from '../../templates/components/PageHeader';
import { ResourceCrudSurface } from '../../templates/components/ResourceCrudSurface';
import { useResourceCrud } from '../../templates/hooks/useResourceCrud';

export function AgentsPage({ data, apiStatus, loading, loadData, setApiStatus }) {
  const crud = useResourceCrud({ resource: 'agents', data, loadData, setApiStatus });
  const statusWarning = apiStatus.includes('gagal') || apiStatus.includes('belum');

  return (
    <>
      <PageHeader config={crud.config} countLabel={crud.filteredRows.length + ' records'} onRefresh={loadData} />
      <StatusStrip warning={statusWarning}>{loading || crud.busy ? 'Memuat data...' : apiStatus}</StatusStrip>
      <ResourceCrudSurface resource="agents" data={data} loading={loading} crud={crud} />
    </>
  );
}

