import { ErrorMessage } from '../../../../domain';
import { FlagDetail, FlagDetailDisplay, FlagPath, Flags } from './case-flag.model';

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
  selectedFlag?: FlagDetailDisplay;
}
