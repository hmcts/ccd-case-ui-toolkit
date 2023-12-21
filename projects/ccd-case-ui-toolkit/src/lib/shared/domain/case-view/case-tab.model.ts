// tslint:disable:variable-name
import { Type } from 'class-transformer';
import { CaseField } from '../definition';
import { Orderable } from '../order';

// @dynamic
export class CaseTab implements Orderable {
  public id: string;
  public label: string;
  public order?: number;
  @Type(() => CaseField)
  public fields: CaseField[];
  public show_condition?: string;
}
