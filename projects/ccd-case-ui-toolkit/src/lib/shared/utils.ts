import { SessionStorageService } from './services';
import { CurrentUserService } from './services/session/current-user.service';
export const PUI_CASE_MANAGER = 'pui-case-manager';
export const JUDGE = 'judge';


export function isInternalUser(sessionStorageService: SessionStorageService): boolean {
  const userDetails = CurrentUserService.readUserInfo(sessionStorageService);
  return !!userDetails?.roles
    && !(userDetails.roles.includes(PUI_CASE_MANAGER)
      || userDetails.roles.some((role: string) => role.toLowerCase().includes(JUDGE)));
}

export function isJudiciaryUser(sessionStorageService: SessionStorageService): boolean {
  const userDetails = CurrentUserService.readUserInfo(sessionStorageService);
  return !!userDetails?.roles
    && (userDetails.roles.some((role: string) => role.toLowerCase().includes(JUDGE)));
}
