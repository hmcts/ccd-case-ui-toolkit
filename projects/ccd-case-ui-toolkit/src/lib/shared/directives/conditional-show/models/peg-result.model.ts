export class PegCondition {
  public fieldReference: string;
  public comparator: string;
  public value: string;
}

export class PegConditionResult {
  public conditions: PegCondition[];
}
