import { SessionStorageService } from './services';

export const USER_DETAILS = 'userDetails';
export const PUI_CASE_MANAGER = 'pui-case-manager';
export const JUDGE = 'judge';

export function safeJsonParse<T>(value: string | null, fallback: T | null = null): T | null {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function getUserDetails(sessionStorageService: SessionStorageService): any {
  const item = sessionStorageService?.getItem(USER_DETAILS);
  return safeJsonParse(item, null);
}


export function isInternalUser(sessionStorageService: SessionStorageService): boolean {
  const userDetails = getUserDetails(sessionStorageService);
  return userDetails && userDetails?.roles
    && !(userDetails.roles.includes(PUI_CASE_MANAGER)
      || userDetails.roles.some((role: string) => role.toLowerCase().includes(JUDGE)));
}

export function isJudiciaryUser(sessionStorageService: SessionStorageService): boolean {
  const userDetails = getUserDetails(sessionStorageService);
  return userDetails && userDetails?.roles
    && (userDetails.roles.some((role: string) => role.toLowerCase().includes(JUDGE)));
}
