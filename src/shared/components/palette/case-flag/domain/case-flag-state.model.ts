import { ErrorMessage } from '../../../../domain';

export interface CaseFlagState {
  currentCaseFlagFieldState: number;
  isParentFlagType?: boolean;
  errorMessages: ErrorMessage[];
  listOfValues?: {key: string, value: string}[];
}
