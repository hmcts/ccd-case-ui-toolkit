import { ErrorMessage } from '../../../../domain';

export interface LinkedCasesState {
  currentLinkedCasesPage: number;
  errorMessages?: ErrorMessage[];
  navigateToNextPage: boolean;
  navigateToPreviousPage?: boolean;
}

export interface LinkedCasesError {
  componentId: string;
  errorMessage: string
}
