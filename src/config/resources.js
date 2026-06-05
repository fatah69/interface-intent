import { actionPage } from '../features/actions/config';
import { agentPage } from '../features/agents/config';
import { agentUtilityPage } from '../features/agent-utilities/config';
import { chatPage } from '../features/ai-chat/config';
import { externalDataPage } from '../features/external-data/config';
import { intentPage } from '../features/intents/config';
import { semanticSearchPage } from '../features/semantic-search/config';
import { rolePage } from '../features/roles/config';
import { usecasePage } from '../features/usecases/config';
import { userPage } from '../features/users/config';
import { utilityPage } from '../features/utilities/config';
import { vectorCollectionPage } from '../features/vector-collections/config';

export const modules = {
  intents: intentPage,
  actions: actionPage,
  externalData: externalDataPage,
  agents: agentPage,
  mappings: agentUtilityPage,
  semanticSearches: semanticSearchPage,
  roles: rolePage,
  usecases: usecasePage,
  utilities: utilityPage,
  vectorCollections: vectorCollectionPage,
  users: userPage,
  chat: chatPage,
};

export const moduleOrder = ['intents', 'usecases', 'actions', 'externalData', 'agents', 'mappings', 'semanticSearches', 'utilities', 'vectorCollections', 'roles', 'users', 'chat'];
export const supportResourceOrder = [];
export const dataResourceOrder = [...moduleOrder.filter((key) => key !== 'chat'), ...supportResourceOrder];
export const emptyData = Object.fromEntries([...moduleOrder, ...supportResourceOrder].map((key) => [key, []]));

export const routeByModule = {
  intents: '/intents',
  actions: '/actions',
  externalData: '/external-data',
  agents: '/agents',
  mappings: '/agent-utilities',
  semanticSearches: '/semantic-search',
  usecases: '/usecases',
  utilities: '/utilities',
  vectorCollections: '/vector-collections',
  roles: '/roles',
  users: '/users',
  chat: '/chat',
};

export const moduleByRoute = Object.fromEntries(
  Object.entries(routeByModule).map(([key, path]) => [path, key]),
);

export const navGroups = [
  {
    title: 'AI-Configuration',
    items: [
      { key: 'intents' },
      { key: 'usecases' },
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
      { key: 'roles' },
      { key: 'users' },
      { key: 'chat' },
    ],
  },
];
