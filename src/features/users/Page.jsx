import { ShieldAlert } from 'lucide-react';
import { PageHeader, StatusStrip } from '../../templates/components/PageHeader';
import { ResourceCrudSurface } from '../../templates/components/ResourceCrudSurface';
import { useResourceCrud } from '../../templates/hooks/useResourceCrud';

function ForbiddenUsers() {
  return (
    <section className="data-panel forbidden-panel">
      <ShieldAlert size={28} />
      <strong>User Management hanya untuk admin.</strong>
      <p>Akun non-admin tetap bisa memakai fitur konfigurasi yang tersedia, tetapi tidak melihat menu kelola user.</p>
    </section>
  );
}

export function UsersPage({ data, apiStatus, loading, loadData, setApiStatus, user }) {
  const crud = useResourceCrud({ resource: 'users', data, loadData, setApiStatus });
  const statusWarning = apiStatus.includes('gagal') || apiStatus.includes('belum');
  const isAdmin = user?.role?.name === 'admin';

  return (
    <>
      <PageHeader config={crud.config} countLabel={crud.filteredRows.length + ' records'} onRefresh={loadData} />
      <StatusStrip warning={statusWarning}>{loading || crud.busy ? 'Memuat data...' : apiStatus}</StatusStrip>
      {isAdmin ? <ResourceCrudSurface resource="users" data={data} loading={loading} crud={crud} /> : <ForbiddenUsers />}
    </>
  );
}
