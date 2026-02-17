import { SessionStorageService } from './services';
import { safeJsonParseFallback } from './json-utils';

export const USER_DETAILS = 'userDetails';
export const PUI_CASE_MANAGER = 'pui-case-manager';
export const JUDGE = 'judge';


function getUserDetails(sessionStorageService: SessionStorageService): any {
  const item = sessionStorageService?.getItem(USER_DETAILS);
  return safeJsonParseFallback(item, null);
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
