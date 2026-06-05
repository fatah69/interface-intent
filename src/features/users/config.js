import { Users } from 'lucide-react';

export const userPage = {
  title: 'Users',
  singular: 'User',
  icon: Users,
  description: 'Kelola akun, role, dan akses usecase pengguna.',
  adminOnly: true,
  fields: [
    { key: 'username', label: 'Username', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'password', label: 'Password', type: 'password', createRequired: true, placeholder: 'Isi untuk user baru atau ganti password' },
    { key: 'role_id', label: 'Role', type: 'relation', resource: 'roles', required: true },
    { key: 'usecase_ids', label: 'Usecases', type: 'multiRelation', resource: 'usecases' },
  ],
  columns: ['id', 'username', 'email', 'role_id', 'usecase_ids'],
};
