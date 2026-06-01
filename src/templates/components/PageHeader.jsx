import { RefreshCw } from 'lucide-react';

export function PageHeader({ config, eyebrow = 'Intent & Agent Management', countLabel, onRefresh, refreshTitle = 'Refresh data' }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{config.title}</h1>
        <p>{config.description} <span className="record-count">{countLabel}</span></p>
      </div>
      <button className="icon-button" onClick={onRefresh} title={refreshTitle}>
        <RefreshCw size={18} />
      </button>
    </header>
  );
}

export function StatusStrip({ children, warning = false }) {
  return (
    <section className="status-strip">
      <span className={warning ? 'dot warning' : 'dot'} />
      {children}
    </section>
  );
}
