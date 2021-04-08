export class PegCondition {
  fieldReference: string;
  comparator: string;
  value: string;
}

export class PegConditionResult {
  conditions: PegCondition[];
}
