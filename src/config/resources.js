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
import { vectorCollectionFilesPage, vectorCollectionPage, vectorKnowledgeUploadPage } from '../features/vector-collections/config';

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
  vectorKnowledgeUpload: vectorKnowledgeUploadPage,
  vectorCollectionFiles: vectorCollectionFilesPage,
  users: userPage,
  chat: chatPage,
};

export const moduleOrder = ['intents', 'usecases', 'actions', 'externalData', 'agents', 'mappings', 'semanticSearches', 'utilities', 'vectorCollections', 'vectorKnowledgeUpload', 'vectorCollectionFiles', 'roles', 'users', 'chat'];
export const dataResourceOrder = ['intents', 'usecases', 'actions', 'externalData', 'agents', 'mappings', 'semanticSearches', 'utilities', 'vectorCollections', 'roles', 'users'];
export const emptyData = Object.fromEntries(moduleOrder.map((key) => [key, []]));

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
  vectorKnowledgeUpload: '/vector-collections/upload',
  vectorCollectionFiles: '/vector-collections/files',
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
      {
        key: 'vectorCollections',
        defaultChild: 'vectorKnowledgeUpload',
        children: [
          { key: 'vectorKnowledgeUpload' },
          { key: 'vectorCollectionFiles' },
        ],
      },
      { key: 'roles' },
      { key: 'users' },
      { key: 'chat' },
    ],
  },
];
