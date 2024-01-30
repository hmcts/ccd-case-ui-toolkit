import { Orderable } from '../order';

export class CaseViewTrigger implements Orderable {
  public id: string;
  public name: string;
  public description: string;
  public order?: number;
}
