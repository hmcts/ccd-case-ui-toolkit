import { SessionStorageService } from "./services";

export const USER_DETAILS = 'userDetails';
export const PUI_CASE_MANAGER = 'pui-case-manager';
export const JUDGE = 'judge';

export function isInternalUser(sessionStorageService: SessionStorageService): boolean {
  const userDetails = JSON.parse(sessionStorageService?.getItem(USER_DETAILS));
  return userDetails && userDetails.roles
    && !(userDetails.roles.includes(PUI_CASE_MANAGER)
      || userDetails.roles.some((role) => role.toLowerCase().includes(JUDGE)));
}
