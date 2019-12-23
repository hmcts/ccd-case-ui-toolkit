import { CaseTypeLite } from './case-type-lite.model';
import { Banner } from './banner.model';

export class Jurisdiction {
  id: string;
  name: string;
  description: string;
  caseTypes: CaseTypeLite[];
}
