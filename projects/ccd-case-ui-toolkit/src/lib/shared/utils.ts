import { SessionStorageService } from "./services";

export const USER_DETAILS = 'userDetails';
export const PUI_CASE_MANAGER = 'pui-case-manager';
export const JUDGE = 'judge';

export class FeatureVariation {
  public jurisdiction: string;
  public includeCaseTypes?: string[];
  public caseType?: string;
}

export function isInternalUser(sessionStorageService: SessionStorageService): boolean {
  const userDetails = JSON.parse(sessionStorageService?.getItem(USER_DETAILS));
  return userDetails && userDetails.roles
    && !(userDetails.roles.includes(PUI_CASE_MANAGER)
      || userDetails.roles.some((role) => role.toLowerCase().includes(JUDGE)));
}

export function hasMatchedJurisdictionAndCaseType(featureVariation: FeatureVariation, jurisdictionId: string, caseType: string): boolean {
  if (featureVariation.jurisdiction === jurisdictionId) {
    if ((featureVariation?.caseType === caseType) ||
      (featureVariation?.includeCaseTypes?.length > 0 &&
        featureVariation?.includeCaseTypes.some((ct) => ct === caseType || new RegExp('^'+ ct + '$').test(caseType)))) {
      return true;
    }
  }
  return false;
}
