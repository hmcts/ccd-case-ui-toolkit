import { ErrorMessage } from '../../../../domain';
import { FlagDetail, Flags, FlagPath } from './case-flag.model';

export interface CaseFlagState {
  currentCaseFlagFieldState: number;
  selectedFlagsLocation?: Flags;
  isParentFlagType?: boolean;
  errorMessages: ErrorMessage[];
  flagName?: string;
  flagPath?: FlagPath[];
  hearingRelevantFlag?: boolean;
  flagCode?: string;
  listOfValues?: { key: string, value: string }[];
  selectedFlagDetail?: FlagDetail;
  flagsCaseFieldId?: string;
}
