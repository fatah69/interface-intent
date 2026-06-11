import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { api } from './api/client';
import { featurePages } from './features';
import { LoginPage } from './features/auth/LoginPage';
import { canAccessModule, getPostLoginRoute, getUserUsecases, isAdminUser, userHasUsecase } from './features/auth/access';
import { useAuthStore } from './features/auth/authStore';
import { AssignmentRequiredState } from './templates/components/AssignmentRequiredState';
import { ForbiddenState } from './templates/components/ForbiddenState';
import { Sidebar } from './templates/components/Sidebar';
import { dataResourceOrder, emptyData, moduleOrder, modules, routeByModule } from './config/resources';
import { normalizeList } from './utils/resourceUtils.jsx';

function CheckingSession() {
  return (
    <main className="auth-screen">
      <section className="auth-panel compact">
        <p className="eyebrow">Secure Access</p>
        <h1>Checking session</h1>
      </section>
    </main>
  );
}

function App() {
  const { initialized, loadProfile, logout, token, user } = useAuthStore();
  const [data, setData] = useState(emptyData);
  const [apiStatus, setApiStatus] = useState('Menunggu data.');
  const [loading, setLoading] = useState(false);
  const defaultRoute = getPostLoginRoute(user);
  const missingUsecaseAssignment = Boolean(user) && !isAdminUser(user) && !userHasUsecase(user);

  async function loadData() {
    setLoading(true);
    const nextData = { ...emptyData };
    const failedResources = [];
    let successCount = 0;
    const isAdmin = isAdminUser(user);

    await Promise.all(
      dataResourceOrder.map(async (key) => {
        if (modules[key]?.adminOnly && !isAdmin) {
          nextData[key] = key === 'usecases' ? getUserUsecases(user) : [];
          return;
        }

        if (!api.can(key, 'read')) {
          nextData[key] = [];
          return;
        }

        try {
          nextData[key] = normalizeList(await api.list(key));
          successCount += 1;
        } catch {
          nextData[key] = [];
          failedResources.push(modules[key].title);
        }
      }),
    );

    setData(nextData);
    if (failedResources.length === 0 && successCount > 0) {
      setApiStatus('Data terbaru berhasil dimuat.');
    } else if (successCount > 0) {
      setApiStatus(`Sebagian data belum berhasil dimuat: ${failedResources.join(', ')}.`);
    } else {
      setApiStatus('Data belum bisa dimuat. Periksa koneksi atau sesi login.');
    }
    setLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!initialized || !token || !user) return;
    loadData();
  }, [initialized, token, user]);

  if (!initialized) return <CheckingSession />;

  if (!token) return <LoginPage />;

  if (!user) return <CheckingSession />;

  const pageProps = {
    data,
    apiStatus,
    loading,
    loadData,
    setApiStatus,
  };

  return (
    <div className="app-shell">
      <Sidebar data={data} user={user} onLogout={logout} />
      <main className="workspace">
        <Routes>
          <Route path="/" element={<Navigate to={defaultRoute} replace />} />
          {moduleOrder.map((key) => {
            const Page = featurePages[key];
            const config = modules[key];
            let element = <Page {...pageProps} user={user} />;

            if (!canAccessModule(user, config)) {
              element = <ForbiddenState user={user} onLogout={logout} />;
            } else if (missingUsecaseAssignment) {
              element = <AssignmentRequiredState user={user} onLogout={logout} onRefresh={loadProfile} refreshing={loading} />;
            }

            return <Route key={key} path={routeByModule[key]} element={element} />;
          })}
          <Route path="*" element={<Navigate to={defaultRoute} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
