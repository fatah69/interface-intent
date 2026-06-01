import { Database } from 'lucide-react';
import { protocolOptions } from '../../config/resourceOptions';

export const externalDataPage = {
  title: 'External Data',
  singular: 'External Data',
  icon: Database,
  description: 'Konfigurasi sumber data eksternal untuk action.',
  fields: [
    { key: 'protocol_request', label: 'Protocol', type: 'select', options: protocolOptions, required: true },
    { key: 'host', label: 'Host', type: 'text', required: true },
    { key: 'header', label: 'Header JSON', type: 'json', placeholder: '{"x-client":"dashboard"}' },
    { key: 'default_param', label: 'Default Param JSON', type: 'json', placeholder: '{"limit":10}' },
  ],
  columns: ['id', 'protocol_request', 'host'],
};

