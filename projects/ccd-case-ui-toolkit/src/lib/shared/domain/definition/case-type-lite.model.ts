import { CaseEvent } from './case-event.model';
import { CaseState } from './case-state.model';

// Light clone of CaseType to be used in Jurisdiction class
// to  avoid cyclic dependency
export class CaseTypeLite {
  public id: string;
  public name: string;
  public events: CaseEvent[];
  public states: CaseState[];
  public description: string;
}
