import { ErrorMessage } from "../../../../domain";

export interface LinkedCasesState {
  currentLinkedCasesPage: number;
  errorMessages: ErrorMessage[];
}
