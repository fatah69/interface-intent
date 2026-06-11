import { isAdminUser } from '../auth/access';
import { ForbiddenState } from '../../templates/components/ForbiddenState';
import { PageHeader, StatusStrip } from '../../templates/components/PageHeader';
import { ResourceCrudSurface } from '../../templates/components/ResourceCrudSurface';
import { useResourceCrud } from '../../templates/hooks/useResourceCrud';

export function RolesPage({ data, apiStatus, loading, loadData, setApiStatus, user }) {
  const crud = useResourceCrud({ resource: 'roles', data, loadData, setApiStatus });
  const statusWarning = apiStatus.includes('gagal') || apiStatus.includes('belum');
  const isAdmin = isAdminUser(user);

  return (
    <>
      <PageHeader config={crud.config} countLabel={crud.filteredRows.length + ' records'} onRefresh={loadData} />
      <StatusStrip warning={statusWarning}>{loading || crud.busy ? 'Memuat data...' : apiStatus}</StatusStrip>
      {isAdmin ? <ResourceCrudSurface resource="roles" data={data} loading={loading} crud={crud} /> : <ForbiddenState user={user} />}
    </>
  );
}
