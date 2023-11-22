import { SortOrder } from '../../../../../../domain/sort-order.enum';

export interface QueryListColumn {
  name: string;
  displayName: string;
  sortOrder: SortOrder;
}
