import { SessionStorageService } from './services';
import { safeJsonParse } from './json-utils';
import { UserInfo } from './domain/user/user-info.model';
import { RoleCategory, AMRoleSuffix, RoleKeyword } from './domain'; 

export const USER_DETAILS = 'userDetails';
export const PUI_CASE_MANAGER = 'pui-case-manager';


export function getUserDetails(sessionStorageService: SessionStorageService): UserInfo | null {
  const item = sessionStorageService?.getItem(USER_DETAILS);
  return safeJsonParse(item, null);
}

export function isInternalUser(sessionStorageService: SessionStorageService): boolean {
  const userDetails = getUserDetails(sessionStorageService);

  if (!userDetails || !userDetails?.roles) {
    return false;
  } else if (userDetails?.roleCategories?.includes(RoleCategory.ENFORCEMENT)) {
    return true;
  } else {
    return !(userDetails.roles.includes(PUI_CASE_MANAGER) || 
      userDetails.roles.some((role: string) => role.toLowerCase().includes(RoleKeyword.JUDGE)))
  }
}

export function isJudiciaryUser(sessionStorageService: SessionStorageService): boolean {
  const userDetails = getUserDetails(sessionStorageService);
  return !!userDetails?.roles
    && (userDetails.roles.some((role: string) => role.toLowerCase().includes(RoleKeyword.JUDGE)));
}

function roleHasKeyword(keyword: string, roleWords: string[]): boolean {
    return roleWords.includes(keyword);
}

export function isWorkAllocationUser(sessionStorageService: SessionStorageService): boolean {
  const userDetails = getUserDetails(sessionStorageService);
  
  return userDetails && userDetails.roles
      && !userDetails.roles.includes(PUI_CASE_MANAGER)
      &&
      (userDetails.roles.includes('caseworker-ia-iacjudge')
        || userDetails.roles.includes('caseworker-ia-caseofficer')
        || userDetails.roles.includes('caseworker-ia-admofficer')
        || userDetails.roles.includes('caseworker-civil')
        || userDetails.roles.includes('caseworker-privatelaw')
        || userDetails?.roleCategories?.includes(RoleCategory.ENFORCEMENT));
}

// fallback purely if roleCategories is not available in 
export function getMappedRoleCategories(roles: string[] = []): RoleCategory[] {

    const roleKeywords: string[] = roles.join().split('-').join().split(',');
    const roleCategoryList: RoleCategory[] = [];

    if (roleHasKeyword(RoleKeyword.JUDGE, roleKeywords)) {
        roleCategoryList.push(RoleCategory.JUDICIAL);
    }
    if (roleHasKeyword(RoleKeyword.SOLICITOR, roleKeywords)) {
        roleCategoryList.push(RoleCategory.PROFESSIONAL);
    }
    if (roleHasKeyword(RoleKeyword.CITIZEN, roleKeywords)) {
        roleCategoryList.push(RoleCategory.CITIZEN);
    }
    if (roleHasKeyword(RoleKeyword.ADMIN, roleKeywords)) {
        roleCategoryList.push(RoleCategory.ADMIN);
    }
    if (roleHasKeyword(RoleKeyword.CTSC, roleKeywords)) {
        roleCategoryList.push(RoleCategory.CTSC);
    }
    if (roleHasKeyword(RoleKeyword.CASEWORKER, roleKeywords)) {
        roleCategoryList.push(RoleCategory.LEGAL_OPERATIONS);
    }
    if (roleHasKeyword(RoleKeyword.ENFORCEMENT, roleKeywords)) {
        roleCategoryList.push(RoleCategory.ENFORCEMENT);
    }

    return roleCategoryList;

}

export function getAMRoleName(accessType: string, aMRole: RoleCategory): string {

  let roleName = '';

  switch (aMRole) {
      case RoleCategory.JUDICIAL:
          roleName = `${accessType}-access-${AMRoleSuffix.JUDICIARY}`;
          break;
      case RoleCategory.PROFESSIONAL:
          roleName = `${accessType}-access-${AMRoleSuffix.PROFESSIONAL}`;
          break;
      case RoleCategory.CITIZEN:
          roleName = `${accessType}-access-${AMRoleSuffix.CITIZEN}`;
          break;
      case RoleCategory.ADMIN:
          roleName = `${accessType}-access-${AMRoleSuffix.ADMIN}`;
          break;
      case RoleCategory.CTSC:
          roleName = `${accessType}-access-${AMRoleSuffix.CTSC}`;
          break;
      case RoleCategory.ENFORCEMENT:
          roleName = `${accessType}-access-${AMRoleSuffix.ENFORCEMENT}`;
          break;
      default:
          roleName = `${accessType}-access-${AMRoleSuffix.LEGAL_OPERATIONS}`;
          break;
  }

  return roleName;
}
