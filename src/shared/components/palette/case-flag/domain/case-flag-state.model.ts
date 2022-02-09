import { ErrorMessage } from "../../../../domain";

export interface CaseFlagState {
  currentCaseFlagFieldState: number;
  errorMessages: ErrorMessage[];
}
