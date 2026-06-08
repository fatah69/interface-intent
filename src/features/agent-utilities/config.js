import { Link2 } from 'lucide-react';

export const agentUtilityPage = {
  title: 'Agent Utilities',
  singular: 'Agent Utility Mapping',
  icon: Link2,
  description: 'Hubungkan AI agent dengan utility dan client.',
  fields: [
    { key: 'ai_agent_id', label: 'AI Agent', type: 'relation', resource: 'agents', required: true },
    { key: 'utility_id', label: 'Utility', type: 'relation', resource: 'utilities', required: true },
    { key: 'client_id', label: 'Client ID', type: 'text', required: true },
  ],
  columns: ['id', 'ai_agent_id', 'utility_id', 'client_id'],
  unavailableTitle: 'Daftar Agent Utilities belum tersedia',
  unavailableDetails: ['Data belum bisa ditampilkan setelah dibuat.', 'Ubah dan hapus belum tersedia dari halaman ini.'],
};
