import { DatabaseZap, FileSearch, UploadCloud } from 'lucide-react';

export const vectorCollectionPage = {
  title: 'Vector Collections',
  singular: 'Vector Collection',
  icon: DatabaseZap,
  description: 'Kelola upload dan file knowledge per collection.',
  fields: [],
  columns: [],
};

export const vectorKnowledgeUploadPage = {
  title: 'Upload Knowledge',
  singular: 'Knowledge Upload',
  icon: UploadCloud,
  description: 'Pilih collection target lalu upload Text atau PDF.',
  fields: [],
  columns: [],
};

export const vectorCollectionFilesPage = {
  title: 'Collection Files',
  singular: 'Collection File',
  icon: FileSearch,
  description: 'Lihat file knowledge yang sudah tersimpan per collection.',
  fields: [],
  columns: [],
};
