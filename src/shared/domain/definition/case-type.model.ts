import { CaseEvent } from './case-event.model';
import { CaseState } from './case-state.model';
import { Jurisdiction } from './jurisdiction.model';
import { CaseField } from './case-field.model';
import { Type } from 'class-transformer';

// @dynamics
export class CaseType {
  id: string;
  name: string;
  events: CaseEvent[];
  states: CaseState[];

  @Type(() => CaseField)
  case_fields: CaseField[];

  description: string;
  jurisdiction: Jurisdiction;
}
