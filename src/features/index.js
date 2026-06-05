import { ActionsPage } from './actions/Page';
import { AgentsPage } from './agents/Page';
import { AgentUtilitiesPage } from './agent-utilities/Page';
import { ChatPage } from './ai-chat/Page';
import { ExternalDataPage } from './external-data/Page';
import { IntentsPage } from './intents/Page';
import { RolesPage } from './roles/Page';
import { SemanticSearchPage } from './semantic-search/Page';
import { UsecasesPage } from './usecases/Page';
import { UsersPage } from './users/Page';
import { UtilitiesPage } from './utilities/Page';
import { VectorCollectionsPage } from './vector-collections/Page';

export const featurePages = {
  intents: IntentsPage,
  actions: ActionsPage,
  externalData: ExternalDataPage,
  agents: AgentsPage,
  mappings: AgentUtilitiesPage,
  semanticSearches: SemanticSearchPage,
  roles: RolesPage,
  usecases: UsecasesPage,
  utilities: UtilitiesPage,
  vectorCollections: VectorCollectionsPage,
  users: UsersPage,
  chat: ChatPage,
};
