import { Search } from 'lucide-react';

export const semanticSearchPage = {
  title: 'Semantic Search',
  singular: 'Semantic Search',
  icon: Search,
  description: 'Kelola collection_name dan gunakan nama yang sama saat chat webhook dipanggil.',
  fields: [{ key: 'collection_name', label: 'Collection Name', type: 'text', required: true }],
  columns: ['id', 'collection_name'],
};
