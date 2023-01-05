import { CaseTypeLite } from './case-type-lite.model';

export class Jurisdiction {
  public id: string;
  public name: string;
  public description: string;
  public caseTypes: CaseTypeLite[];
}
