import { CaseField } from '../../../../domain';

export interface FlagPath {
  id?: string;
  value: string;
}

export interface FlagDetail {
  id?: string;
  name: string;
  name_cy?: string;
  subTypeValue?: string;
  subTypeValue_cy?: string;
  subTypeKey?: string;
  otherDescription?: string;
  otherDescription_cy?: string;
  flagComment?: string;
  flagComment_cy?: string;
  flagUpdateComment?: string;
  dateTimeModified?: Date | string;
  dateTimeCreated: Date | string;
  path: FlagPath[];
  hearingRelevant: boolean | string;
  flagCode: string;
  status: string;
  availableExternally?: boolean | string;
}

export interface Flags {
  // The flagsCaseFieldId property could be removed in future, given that the full path is now available through the
  // FlagsWithFormGroupPath interface
  flagsCaseFieldId?: string;
  partyName?: string;
  roleOnCase?: string;
  details?: FlagDetail[];
  visibility?: string;
  groupId?: string;
}

export interface FlagDetailDisplay {
  partyName: string;
  flagDetail: FlagDetail;
  // The flagsCaseFieldId property could be removed in future, given that the full path is now available through the
  // FlagDetailDisplayWithFormGroupPath interface
  flagsCaseFieldId: string;
  visibility: string;
}

/**
 * Wrapper interface for Flags that adds the path to the corresponding FormGroup, and the CaseField
 */
export interface FlagsWithFormGroupPath {
  flags: Flags;
  pathToFlagsFormGroup: string;
  caseField: CaseField;
}

/**
 * Wrapper interface for FlagDetailDisplay that adds the path to the corresponding FormGroup, the CaseField, and the
 * original flag status
 */
export interface FlagDetailDisplayWithFormGroupPath {
  flagDetailDisplay: FlagDetailDisplay;
  pathToFlagsFormGroup: string;
  caseField: CaseField;
  roleOnCase?: string;
  label?: string;
  originalStatus?: string;
}
