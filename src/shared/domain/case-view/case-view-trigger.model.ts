import { Orderable } from '../order';

export class CaseViewTrigger implements Orderable {
  public static readonly DELETE = 'DELETE';

  public id: string;
  public name: string;
  public description: string;
  public order?: number;
}
