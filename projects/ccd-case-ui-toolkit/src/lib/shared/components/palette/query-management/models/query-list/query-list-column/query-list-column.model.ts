import { SortOrder } from '../../../../complex/sort-order';

export interface QueryListColumn {
  name: string;
  displayName: string;
  sortOrder: SortOrder;
}
