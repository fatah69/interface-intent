import { Network } from 'lucide-react';
import { actionTypes } from '../../config/resourceOptions';

export const actionPage = {
  title: 'Actions',
  singular: 'Action',
  icon: Network,
  description: 'Atur tipe action dan satu target sesuai business rule API.',
  fields: [
    { key: 'action_type', label: 'Action Type', type: 'select', options: actionTypes, required: true },
    { key: 'semantic_search_id', label: 'Semantic Search Target', type: 'relation', resource: 'semanticSearches', actionType: 'semantic_search' },
    { key: 'external_data_id', label: 'External Data Target', type: 'relation', resource: 'externalData', actionType: 'external_data' },
    { key: 'ai_agent_id', label: 'AI Agent Target', type: 'relation', resource: 'agents', actionType: 'ai_agent' },
    { key: 'parameter_needed', label: 'Parameter Needed JSON', type: 'json', placeholder: '{"query":"string"}' },
  ],
  columns: ['id', 'action_type', 'target', 'parameter_needed'],
};

