import { Search } from 'lucide-react';

export const semanticSearchPage = {
  title: 'Semantic Search',
  singular: 'Semantic Search',
  icon: Search,
  description: 'Kelola daftar collection knowledge.',
  fields: [{ key: 'collection_name', label: 'Collection Name', type: 'text', required: true }],
  columns: ['id', 'collection_name'],
};
