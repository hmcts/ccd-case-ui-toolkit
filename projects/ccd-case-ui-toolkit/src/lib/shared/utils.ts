import { SessionStorageService } from './services';

export const USER_DETAILS = 'userDetails';
export const PUI_CASE_MANAGER = 'pui-case-manager';
export const JUDGE = 'judge';

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
  // TODO(EXUI-2073): Decision needed for <NEW_CATEGORY> user classification.
  // QUESTION: Should <NEW_CATEGORY> be treated as internal, judiciary, or external in UI branching?
  // CONTEXT: This helper does not read `userDetails.roleCategory`; it classifies from `roles` text only.
  // CONTEXT: A user is treated as internal when roles exist AND do not include `pui-case-manager` AND no role contains `judge`.
  // CONTEXT: `isJudiciaryUser()` separately classifies judiciary from any role containing `judge`, so <NEW_CATEGORY> behavior depends on role-name conventions.
  return userDetails && userDetails?.roles
    && !(userDetails.roles.includes(PUI_CASE_MANAGER)
      || userDetails.roles.some((role) => role.toLowerCase().includes(JUDGE)));
}

export function isJudiciaryUser(sessionStorageService: SessionStorageService): boolean {
  const userDetails = getUserDetails(sessionStorageService);
  // TODO(EXUI-2073): If <NEW_CATEGORY> should be treated like judge users, update this check to recognise it.
  return userDetails && userDetails?.roles
    && (userDetails.roles.some((role) => role.toLowerCase().includes(JUDGE)));
}

