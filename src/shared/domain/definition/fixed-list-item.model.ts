import { Orderable } from '../order';

export class FixedListItem implements Orderable {
  code: string;
  label: string;
  order?: number;
}
