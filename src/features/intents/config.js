import { Workflow } from 'lucide-react';

export const intentPage = {
  title: 'Intents',
  singular: 'Intent',
  icon: Workflow,
  description: 'Mapping context user ke action yang sesuai.',
  fields: [
    { key: 'usecase_id', label: 'Usecase', type: 'relation', resource: 'usecases', required: true },
    { key: 'context', label: 'Context', type: 'textarea', required: true },
    { key: 'action_id', label: 'Action', type: 'relation', resource: 'actions', required: true },
  ],
  columns: ['id', 'usecase_id', 'context', 'action_summary'],
};
