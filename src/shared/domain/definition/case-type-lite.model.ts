import { CaseEvent } from './case-event.model';
import { CaseState } from './case-state.model';

// Light clone of CaseType to be used in Jurisdiction class
// to  avoid cyclic dependency
export class CaseTypeLite {
  id: string;
  name: string;
  events: CaseEvent[];
  states: CaseState[];
  description: string;
}
