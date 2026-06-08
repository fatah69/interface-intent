import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ExternalLink, Search, X } from 'lucide-react';
import { api } from '../../api/client';
import { PageHeader, StatusStrip } from '../../templates/components/PageHeader';
import { routeByModule } from '../../config/resources';
import { VectorCollectionPanel } from './components/VectorCollectionPanel';
import { vectorCollectionFilesPage, vectorKnowledgeUploadPage } from './config';

function collectionName(item) {
  return item?.name || item?.collection_name || item?.uuid || '-';
}

function collectionFileLabel(item) {
  if (!item?.cmetadata) return '';

  try {
    const metadata = typeof item.cmetadata === 'string' ? JSON.parse(item.cmetadata) : item.cmetadata;
    return metadata?.filename || metadata?.file_name || metadata?.title || metadata?.name || '';
  } catch {
    return '';
  }
}

function openFilePreview({ blob, contentType }) {
  const fileBlob = blob.type ? blob : new Blob([blob], { type: contentType });
  const objectUrl = URL.createObjectURL(fileBlob);
  const opened = window.open(objectUrl, '_blank', 'noopener,noreferrer');

  if (!opened) {
    URL.revokeObjectURL(objectUrl);
    throw new Error('Tab baru tidak bisa dibuka. Izinkan pop-up browser lalu coba lagi.');
  }

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}

export function VectorCollectionsPage() {
  return <Navigate to={routeByModule.vectorKnowledgeUpload} replace />;
}

export function VectorKnowledgeUploadPage({ data, apiStatus, loading, loadData }) {
  const statusWarning = apiStatus.includes('gagal') || apiStatus.includes('belum');
  const vectorCollections = data.vectorCollections || [];
  const semanticCollections = data.semanticSearches || [];
  const collectionCount = vectorCollections.length || semanticCollections.length || 0;

  return (
    <div className="vector-page">
      <PageHeader
        config={vectorKnowledgeUploadPage}
        eyebrow="Knowledge Upload"
        countLabel={`${collectionCount} collections`}
        onRefresh={loadData}
      />
      <StatusStrip warning={statusWarning}>{loading ? 'Memuat data collection...' : apiStatus}</StatusStrip>
      <VectorCollectionPanel semanticCollections={semanticCollections} vectorCollections={vectorCollections} loading={loading} onRefresh={loadData} />
    </div>
  );
}

export function VectorCollectionFilesPage({ data, apiStatus, loading, loadData }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('neutral');
  const [loadingUuid, setLoadingUuid] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const statusWarning = apiStatus.includes('gagal') || apiStatus.includes('belum');
  const vectorCollections = data.vectorCollections || [];

  const filteredCollections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return vectorCollections;
    return vectorCollections.filter((item) => [collectionName(item), collectionFileLabel(item), item.uuid, item.cmetadata]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(needle));
  }, [query, vectorCollections]);

  async function viewFile(item) {
    if (!item?.uuid) return;
    setLoadingUuid(item.uuid);
    setStatusType('neutral');
    setStatus('Membuka file di tab baru...');

    try {
      const file = await api.vectorCollectionFile(item.uuid);
      openFilePreview(file);
      setStatusType('success');
      setStatus(`File dibuka di tab baru: ${collectionName(item)}.`);
    } catch (error) {
      setStatusType('error');
      setStatus(error.message || 'Gagal membuka file collection.');
    } finally {
      setLoadingUuid('');
    }
  }

  return (
    <div className="vector-page">
      <PageHeader
        config={vectorCollectionFilesPage}
        eyebrow="Knowledge Files"
        countLabel={`${vectorCollections.length} files`}
        onRefresh={loadData}
      />
      <StatusStrip warning={statusWarning}>{loading ? 'Memuat file collection...' : apiStatus}</StatusStrip>

      <section className="data-panel collection-files-panel">
        <div className="panel-toolbar">
          <div className="search-box">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari collection atau file" />
          </div>
        </div>

        <div className="collection-file-list">
          {!filteredCollections.length ? (
            <div className="collection-file-empty">
              <strong>Belum ada file knowledge tersimpan.</strong>
              <span>Upload Text atau PDF dari menu Upload Knowledge untuk membuat file collection.</span>
            </div>
          ) : filteredCollections.map((item) => {
            const name = collectionName(item);
            const fileLabel = collectionFileLabel(item);
            return (
              <div className="collection-file-row" key={item.uuid || name}>
                <div>
                  <strong title={name}>{name}</strong>
                  <span title={fileLabel || name}>{fileLabel || 'File collection tersimpan'}</span>
                </div>
                <button className="secondary-button" type="button" onClick={() => setSelectedFile(item)} disabled={loading || !item.uuid}>Detail</button>
              </div>
            );
          })}
        </div>

        <div className={`vector-status ${statusType}`}>{status || `${filteredCollections.length} file collection ditampilkan.`}</div>
      </section>

      {selectedFile && (
        <aside className="drawer-backdrop">
          <section className="detail-drawer collection-file-drawer">
            <div className="drawer-header">
              <div>
                <p className="eyebrow">Collection File</p>
                <h2>{collectionName(selectedFile)}</h2>
              </div>
              <button type="button" className="ghost-button" onClick={() => setSelectedFile(null)}><X size={18} /></button>
            </div>

            <dl className="detail-list">
              <div><dt>Status file</dt><dd>{selectedFile.uuid ? 'Tersimpan' : 'Belum tersimpan'}</dd></div>
              <div><dt>Nama file</dt><dd>{collectionFileLabel(selectedFile) || 'File collection tersimpan'}</dd></div>
              <div><dt>Collection</dt><dd>{collectionName(selectedFile)}</dd></div>
            </dl>

            <div className="hint-box collection-file-hint">
              <ExternalLink size={16} />
              <span>File asli hanya dibuka setelah tombol Open File ditekan.</span>
            </div>

            <div className="drawer-actions">
              <button type="button" className="secondary-button" onClick={() => setSelectedFile(null)}>Tutup</button>
              <button type="button" className="primary-button" onClick={() => viewFile(selectedFile)} disabled={loadingUuid === selectedFile.uuid || !selectedFile.uuid}>
                <ExternalLink size={16} />
                {loadingUuid === selectedFile.uuid ? 'Opening...' : 'Open File'}
              </button>
            </div>
          </section>
        </aside>
      )}
    </div>
  );
}
