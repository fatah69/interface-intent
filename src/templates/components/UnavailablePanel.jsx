import { Info } from 'lucide-react';

export function UnavailablePanel({ config, canCreate }) {
  return (
    <div className="unavailable-panel">
      <Info size={22} />
      <div>
        <h3>{config.unavailableTitle || 'Data belum tersedia'}</h3>
        <p>{canCreate ? 'Tambah data tersedia, tetapi daftar belum dapat ditampilkan setelah dibuat.' : 'Data untuk halaman ini belum tersedia.'}</p>
        {config.unavailableDetails && (
          <ul>
            {config.unavailableDetails.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
