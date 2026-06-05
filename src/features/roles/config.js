import { Shield } from 'lucide-react';

export const rolePage = {
  title: 'Roles',
  singular: 'Role',
  icon: Shield,
  description: 'Daftar role untuk user management.',
  adminOnly: true,
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
  ],
  columns: ['id', 'name', 'description'],
};
