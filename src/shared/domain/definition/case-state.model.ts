import { Orderable } from '../order';

export class CaseState implements Orderable {
  public id: string;
  public name: string;
  public description: string;
  public order?: number;
}
