export const actionTypes = ['semantic_search', 'external_data', 'ai_agent'];
export const protocolOptions = ['http_get', 'https_post', 'grpc'];
export const actionTargetFields = ['semantic_search_id', 'external_data_id', 'ai_agent_id'];

export const relationResourceByColumn = {
  action_id: 'actions',
  role_id: 'roles',
  usecase_id: 'usecases',
  semantic_search_id: 'semanticSearches',
  external_data_id: 'externalData',
  ai_agent_id: 'agents',
  utility_id: 'utilities',
};

export const actionTypeTarget = {
  semantic_search: 'semantic_search_id',
  external_data: 'external_data_id',
  ai_agent: 'ai_agent_id',
};
