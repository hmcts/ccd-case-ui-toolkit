// tslint:disable:variable-name
import { Type } from 'class-transformer';
import { CaseEvent } from './case-event.model';
import { CaseField } from './case-field.model';
import { CaseState } from './case-state.model';
import { Jurisdiction } from './jurisdiction.model';

// @dynamics
export class CaseType {
  public id: string;
  public name: string;
  public events: CaseEvent[];
  public states: CaseState[];

  @Type(() => CaseField)
  public case_fields: CaseField[];

  public description: string;
  public jurisdiction: Jurisdiction;
  public printEnabled?: boolean;
}
