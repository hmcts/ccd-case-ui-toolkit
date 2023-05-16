import { SortOrder } from '../../../complex/sort-order';

export interface column {
    name: string;
    displayName: string;
    sortOrder: SortOrder;
  }