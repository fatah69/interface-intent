import { Info } from 'lucide-react';

export function UnavailablePanel({ config, canCreate }) {
  return (
    <div className="unavailable-panel">
      <Info size={22} />
      <div>
        <h3>{config.unavailableTitle || 'Endpoint read belum tersedia'}</h3>
        <p>{canCreate ? 'Create tersedia, tetapi list/read belum tersedia sehingga data tidak dapat ditampilkan setelah dibuat.' : 'Swagger live belum expose endpoint untuk resource ini.'}</p>
        {config.unavailableDetails && (
          <ul>
            {config.unavailableDetails.map((item) => <li key={item}><code>{item}</code></li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
