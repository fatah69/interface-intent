import { ShieldAlert } from 'lucide-react';
import { PageHeader, StatusStrip } from '../../templates/components/PageHeader';
import { ResourceCrudSurface } from '../../templates/components/ResourceCrudSurface';
import { useResourceCrud } from '../../templates/hooks/useResourceCrud';

function ForbiddenRoles() {
  return (
    <section className="data-panel forbidden-panel">
      <ShieldAlert size={28} />
      <strong>Role Management hanya untuk admin.</strong>
      <p>Akun non-admin tidak melihat menu kelola role.</p>
    </section>
  );
}

export function RolesPage({ data, apiStatus, loading, loadData, setApiStatus, user }) {
  const crud = useResourceCrud({ resource: 'roles', data, loadData, setApiStatus });
  const statusWarning = apiStatus.includes('gagal') || apiStatus.includes('belum');
  const isAdmin = user?.role?.name === 'admin';

  return (
    <>
      <PageHeader config={crud.config} countLabel={crud.filteredRows.length + ' records'} onRefresh={loadData} />
      <StatusStrip warning={statusWarning}>{loading || crud.busy ? 'Memuat data...' : apiStatus}</StatusStrip>
      {isAdmin ? <ResourceCrudSurface resource="roles" data={data} loading={loading} crud={crud} /> : <ForbiddenRoles />}
    </>
  );
}
