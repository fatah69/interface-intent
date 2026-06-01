import { ActionsPage } from './actions/Page';
import { AgentsPage } from './agents/Page';
import { AgentUtilitiesPage } from './agent-utilities/Page';
import { ChatPage } from './ai-chat/Page';
import { ExternalDataPage } from './external-data/Page';
import { IntentsPage } from './intents/Page';
import { SemanticSearchPage } from './semantic-search/Page';
import { UtilitiesPage } from './utilities/Page';
import { VectorCollectionsPage } from './vector-collections/Page';

export const featurePages = {
  intents: IntentsPage,
  actions: ActionsPage,
  externalData: ExternalDataPage,
  agents: AgentsPage,
  mappings: AgentUtilitiesPage,
  semanticSearches: SemanticSearchPage,
  utilities: UtilitiesPage,
  vectorCollections: VectorCollectionsPage,
  chat: ChatPage,
};
