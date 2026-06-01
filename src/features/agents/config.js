import { Bot } from 'lucide-react';
import { protocolOptions } from '../../config/resourceOptions';

export const agentPage = {
  title: 'AI Agents',
  singular: 'AI Agent',
  icon: Bot,
  description: 'Kelola host, header, dan default parameter agent.',
  fields: [
    { key: 'agent_name', label: 'Agent Name', type: 'text', required: true },
    { key: 'protocol_request', label: 'Protocol', type: 'select', options: protocolOptions, required: true },
    { key: 'host', label: 'Host', type: 'text', required: true },
    { key: 'header', label: 'Header JSON', type: 'json', placeholder: '{"Authorization":"Bearer token"}' },
    { key: 'default_param', label: 'Default Param JSON', type: 'json', placeholder: '{"language":"id"}' },
  ],
  columns: ['id', 'agent_name', 'protocol_request', 'host'],
};

