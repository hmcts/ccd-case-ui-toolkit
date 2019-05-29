import { Field } from '../search/field.model';
import { Orderable } from '../order/orderable.model';

export class WorkbasketInputModel implements Orderable {
    constructor(
      public label: string,
      public order: number,
      public field: Field,
      public metadata?: boolean) {
    }
}

export class WorkbasketInput {
  public workbasketInputs: WorkbasketInputModel[]
}
