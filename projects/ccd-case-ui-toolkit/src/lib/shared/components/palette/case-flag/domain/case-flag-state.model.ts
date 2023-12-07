import { ErrorMessage } from '../../../../domain';
import { FlagDetailDisplayWithFormGroupPath } from './case-flag.model';

export interface CaseFlagState {
  currentCaseFlagFieldState: number;
  isParentFlagType?: boolean;
  errorMessages: ErrorMessage[];
  selectedFlag?: FlagDetailDisplayWithFormGroupPath;
}
