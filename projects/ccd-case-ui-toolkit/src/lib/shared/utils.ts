import { SessionStorageService } from './services';
import { safeJsonParse } from './json-utils';
import { RoleCategory, AMRoleSuffix, RoleKeyword } from './domain'; 

export const USER_DETAILS = 'userDetails';
export const PUI_CASE_MANAGER = 'pui-case-manager';


function getUserDetails(sessionStorageService: SessionStorageService): any {
  const item = sessionStorageService?.getItem(USER_DETAILS);
  return safeJsonParse(item, null);
}


export function isInternalUser(sessionStorageService: SessionStorageService): boolean {
  const userDetails = getUserDetails(sessionStorageService);

  if (!userDetails?.roles) {
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
  return userDetails && userDetails?.roles
    && (userDetails.roles.some((role: string) => role.toLowerCase().includes(RoleKeyword.JUDGE)));
}

export function isWorkAllocationUser(sessionStorageService: SessionStorageService): boolean {
  const userDetails = getUserDetails(sessionStorageService);
  
  return userDetails?.roles
      && !userDetails.roles.includes(PUI_CASE_MANAGER)
      &&
      (userDetails.roles.includes('caseworker-ia-iacjudge')
        || userDetails.roles.includes('caseworker-ia-caseofficer')
        || userDetails.roles.includes('caseworker-ia-admofficer')
        || userDetails.roles.includes('caseworker-civil')
        || userDetails.roles.includes('caseworker-privatelaw')
        || userDetails?.roleCategories?.includes(RoleCategory.ENFORCEMENT));
}

function roleOrCategoryExists(roleKeyword: string, roleCategory: string, roleKeywords: string[], roleCategories: string[]): boolean {
  return roleCategories.includes(roleCategory) || roleKeywords.includes(roleKeyword);
}

export function getMappedRoleCategory(roles: string[] = [], roleCategories: string[] = []): RoleCategory {

  const roleKeywords: string[] = roles.join().split('-').join().split(',');

  if (roleOrCategoryExists(RoleKeyword.JUDGE, RoleCategory.JUDICIAL, roleKeywords, roleCategories)) {
      return RoleCategory.JUDICIAL;

  } else if (roleOrCategoryExists(RoleKeyword.SOLICITOR, RoleCategory.PROFESSIONAL, roleKeywords, roleCategories)) {
      return RoleCategory.PROFESSIONAL;

  } else if (roleOrCategoryExists(RoleKeyword.CITIZEN, RoleCategory.CITIZEN, roleKeywords, roleCategories)) {
      return RoleCategory.CITIZEN;

  } else if (roleOrCategoryExists(RoleKeyword.ADMIN, RoleCategory.ADMIN, roleKeywords, roleCategories)) {
      return RoleCategory.ADMIN;

  } else if (roleOrCategoryExists(RoleKeyword.CTSC, RoleCategory.CTSC, roleKeywords, roleCategories)) {
      return RoleCategory.CTSC;

  } else if (roleOrCategoryExists(RoleKeyword.ENFORCEMENT, RoleCategory.ENFORCEMENT, roleKeywords, roleCategories)) {
      return RoleCategory.ENFORCEMENT;

  } else {
      return RoleCategory.LEGAL_OPERATIONS;
  }
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