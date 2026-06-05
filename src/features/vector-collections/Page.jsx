import { PageHeader, StatusStrip } from '../../templates/components/PageHeader';
import { VectorCollectionPanel } from './components/VectorCollectionPanel';
import { vectorCollectionPage } from './config';

export function VectorCollectionsPage({ data, apiStatus, loading, loadData }) {
  const statusWarning = apiStatus.includes('gagal') || apiStatus.includes('belum');
  const vectorCollections = data.vectorCollections || [];
  const semanticCollections = data.semanticSearches || [];
  const collectionCount = vectorCollections.length || semanticCollections.length || 0;

  return (
    <div className="vector-page">
      <PageHeader
        config={vectorCollectionPage}
        eyebrow="Knowledge Upload"
        countLabel={`${collectionCount} collections`}
        onRefresh={loadData}
      />
      <StatusStrip warning={statusWarning}>{loading ? 'Memuat data collection...' : apiStatus}</StatusStrip>
      <VectorCollectionPanel semanticCollections={semanticCollections} vectorCollections={vectorCollections} loading={loading} onRefresh={loadData} />
    </div>
  );
}
