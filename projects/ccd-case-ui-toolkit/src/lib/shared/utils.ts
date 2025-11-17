import { SessionStorageService } from './services';

export const USER_DETAILS = 'userDetails';
export const PUI_CASE_MANAGER = 'pui-case-manager';
export const JUDGE = 'judge';
export const SOLICITOR = 'solicitor';

function getUserDetails(sessionStorageService: SessionStorageService): any {
  try {
    const item = sessionStorageService?.getItem(USER_DETAILS);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}


export function isInternalUser(sessionStorageService: SessionStorageService): boolean {
  const userDetails = getUserDetails(sessionStorageService);
  return userDetails && userDetails?.roles
    && !(userDetails.roles.includes(PUI_CASE_MANAGER)
      || userDetails.roles.some((role) => role.toLowerCase().includes(JUDGE)));
}

export function isJudiciaryUser(sessionStorageService: SessionStorageService): boolean {
  const userDetails = getUserDetails(sessionStorageService);
  return userDetails && userDetails?.roles
    && (userDetails.roles.some((role) => role.toLowerCase().includes(JUDGE)));
}

export function isSolicitorUser(sessionStorageService: SessionStorageService): boolean {
  const userDetails = getUserDetails(sessionStorageService);
  return userDetails && userDetails?.roles
    && (userDetails.roleCategory.includes(SOLICITOR));
}

