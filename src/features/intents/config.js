import { Workflow } from 'lucide-react';

export const intentPage = {
  title: 'Intents',
  singular: 'Intent',
  icon: Workflow,
  description: 'Mapping context user ke action yang sesuai.',
  fields: [
    { key: 'context', label: 'Context', type: 'textarea', required: true },
    { key: 'action_id', label: 'Action', type: 'relation', resource: 'actions', required: true },
  ],
  columns: ['id', 'context', 'action_summary'],
};
