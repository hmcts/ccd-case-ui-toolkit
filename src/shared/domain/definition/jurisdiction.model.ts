import { CaseType } from './case-type.model';

export class Jurisdiction {
  id: string;
  name: string;
  description: string;
  caseTypes: CaseType[];
}
