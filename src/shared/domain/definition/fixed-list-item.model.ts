import { Orderable } from '../order';

export class FixedListItem implements Orderable {
  public code: string;
  public label: string;
  public order?: number;
}
