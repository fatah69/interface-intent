import { PageHeader, StatusStrip } from '../../templates/components/PageHeader';
import { ResourceCrudSurface } from '../../templates/components/ResourceCrudSurface';
import { useResourceCrud } from '../../templates/hooks/useResourceCrud';

export function SemanticSearchPage({ data, apiStatus, loading, loadData, setApiStatus }) {
  const crud = useResourceCrud({ resource: 'semanticSearches', data, loadData, setApiStatus });
  const statusWarning = apiStatus.includes('gagal') || apiStatus.includes('belum');

  return (
    <>
      <PageHeader config={crud.config} countLabel={crud.filteredRows.length + ' records'} onRefresh={loadData} />
      <StatusStrip warning={statusWarning}>{loading || crud.busy ? 'Memuat data...' : apiStatus}</StatusStrip>
      <ResourceCrudSurface resource="semanticSearches" data={data} loading={loading} crud={crud} />
    </>
  );
}
