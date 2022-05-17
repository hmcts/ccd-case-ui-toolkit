import { ErrorMessage } from '../../../../domain';
import { FlagDetail } from './case-flag.model';

export interface CaseFlagState {
  currentCaseFlagFieldState: number;
  isParentFlagType?: boolean;
  errorMessages: ErrorMessage[];
  listOfValues?: { key: string, value: string }[];
  flagCode?: string;
  selectedFlagDetail?: FlagDetail;
}
