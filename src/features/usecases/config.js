import { FolderKanban } from 'lucide-react';

export const usecasePage = {
  title: 'Usecases',
  singular: 'Usecase',
  icon: FolderKanban,
  description: 'Kelola scope usecase untuk intent dan akses user.',
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
  ],
  columns: ['id', 'name', 'description', 'created_at'],
};
