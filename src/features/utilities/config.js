import { Settings2 } from 'lucide-react';

export const utilityPage = {
  title: 'Utilities',
  singular: 'Utility',
  icon: Settings2,
  description: 'Daftar key-value utility untuk agent.',
  fields: [
    { key: 'key', label: 'Key', type: 'text', required: true },
    { key: 'value', label: 'Value', type: 'textarea', required: true },
  ],
  columns: ['id', 'key', 'value'],
};
