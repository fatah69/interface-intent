import { routeByModule } from '../../config/resources';

const roleAdmin = 'admin';

export function getRoleName(user) {
  return String(user?.role?.name || user?.role_name || '').trim().toLowerCase();
}

export function isAdminUser(user) {
  return getRoleName(user) === roleAdmin;
}

function normalizeUsecaseId(value) {
  if (value == null || value === '') return null;
  const id = value.id ?? value.usecase_id ?? value.uuid ?? value;
  return id == null || id === '' ? null : id;
}

export function getUserUsecases(user) {
  const sources = [user?.usecases, user?.user_usecases, user?.assigned_usecases];

  for (const source of sources) {
    if (Array.isArray(source) && source.length) {
      return source
        .map((entry) => {
          const nested = entry?.usecase || entry;
          const id = normalizeUsecaseId(nested);
          if (id == null) return null;
          return typeof nested === 'object'
            ? { ...nested, id: nested.id ?? nested.usecase_id ?? id }
            : { id, name: `Usecase #${id}` };
        })
        .filter(Boolean);
    }
  }

  const ids = getUserUsecaseIds(user);
  return ids.map((id) => ({ id, name: `Usecase #${id}` }));
}

export function getUserUsecaseIds(user) {
  const idSources = [user?.usecase_ids, user?.usecase_id, user?.use_case_ids, user?.use_case_id];
  const ids = [];

  idSources.forEach((source) => {
    const values = Array.isArray(source) ? source : [source];
    values.forEach((value) => {
      const id = normalizeUsecaseId(value);
      if (id != null) ids.push(id);
    });
  });

  [user?.usecases, user?.user_usecases, user?.assigned_usecases].forEach((source) => {
    if (!Array.isArray(source)) return;
    source.forEach((entry) => {
      const id = normalizeUsecaseId(entry?.usecase || entry);
      if (id != null) ids.push(id);
    });
  });

  return [...new Set(ids.map(String))];
}

export function userHasUsecase(user) {
  return getUserUsecaseIds(user).length > 0;
}

export function getPostLoginRoute(user) {
  return routeByModule.intents;
}

export function canAccessModule(user, config) {
  if (config?.adminOnly && !isAdminUser(user)) return false;
  return true;
}
