import { CaseTypeLite } from './case-type-lite.model';

export class Jurisdiction {
  id: string;
  name: string;
  description: string;
  caseTypes: CaseTypeLite[];
}
