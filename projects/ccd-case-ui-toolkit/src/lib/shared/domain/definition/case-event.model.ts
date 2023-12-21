// tslint:disable:variable-name
import { Orderable } from '../order';
import { AccessControlList } from './access-control-list.model';
import { EventCaseField } from './event-case-field.model';

export class CaseEvent implements Orderable {
  public id: string;
  public name: string;
  public post_state: string;
  public pre_states: string[];
  public case_fields: EventCaseField[];
  public description: string;
  public order?: number;
  public acls?: AccessControlList[];
}
