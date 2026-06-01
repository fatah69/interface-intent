import { actionPage } from '../features/actions/config';
import { agentPage } from '../features/agents/config';
import { agentUtilityPage } from '../features/agent-utilities/config';
import { chatPage } from '../features/ai-chat/config';
import { externalDataPage } from '../features/external-data/config';
import { intentPage } from '../features/intents/config';
import { semanticSearchPage } from '../features/semantic-search/config';
import { utilityPage } from '../features/utilities/config';
import { vectorCollectionPage } from '../features/vector-collections/config';

export const modules = {
  intents: intentPage,
  actions: actionPage,
  externalData: externalDataPage,
  agents: agentPage,
  mappings: agentUtilityPage,
  semanticSearches: semanticSearchPage,
  utilities: utilityPage,
  vectorCollections: vectorCollectionPage,
  chat: chatPage,
};

export const moduleOrder = ['intents', 'actions', 'externalData', 'agents', 'mappings', 'semanticSearches', 'utilities', 'vectorCollections', 'chat'];
export const dataResourceOrder = moduleOrder.filter((key) => !['chat', 'vectorCollections'].includes(key));
export const emptyData = Object.fromEntries(moduleOrder.map((key) => [key, []]));

export const navGroups = [
  {
    title: 'AI-Configuration',
    items: [
      { key: 'intents' },
      {
        key: 'actions',
        children: [
          { key: 'externalData' },
          { key: 'agents' },
          { key: 'mappings' },
          { key: 'semanticSearches' },
        ],
      },
      { key: 'utilities' },
      { key: 'vectorCollections' },
      { key: 'chat' },
    ],
  },
];
