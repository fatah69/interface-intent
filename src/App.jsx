import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { api } from './api/client';
import { featurePages } from './features';
import { Sidebar } from './templates/components/Sidebar';
import { dataResourceOrder, emptyData, moduleOrder, modules, routeByModule } from './config/resources';
import { normalizeList } from './utils/resourceUtils.jsx';

function App() {
  const [data, setData] = useState(emptyData);
  const [apiStatus, setApiStatus] = useState('Menunggu data real dari API.');
  const [loading, setLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    const nextData = { ...emptyData };
    const failedResources = [];
    let successCount = 0;

    await Promise.all(
      dataResourceOrder.map(async (key) => {
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
      setApiStatus('Data real dimuat dari endpoint Swagger yang tersedia.');
    } else if (successCount > 0) {
      setApiStatus(`Sebagian endpoint gagal dimuat: ${failedResources.join(', ')}.`);
    } else {
      setApiStatus('API lokal belum bisa diakses. Tidak ada data yang ditampilkan.');
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const pageProps = {
    data,
    apiStatus,
    loading,
    loadData,
    setApiStatus,
  };

  return (
    <div className="app-shell">
      <Sidebar data={data} />
      <main className="workspace">
        <Routes>
          <Route path="/" element={<Navigate to={routeByModule.intents} replace />} />
          {moduleOrder.map((key) => {
            const Page = featurePages[key];
            return <Route key={key} path={routeByModule[key]} element={<Page {...pageProps} />} />;
          })}
          <Route path="*" element={<Navigate to={routeByModule.intents} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
