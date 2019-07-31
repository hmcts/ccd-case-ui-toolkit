import { Orderable } from '../order';
import { CaseField } from '../definition';
import { Type } from 'class-transformer';

// @dynamic
export class CaseTab implements Orderable {
  id: string;
  label: string;
  order?: number;
  @Type(() => CaseField)
  fields: CaseField[];
  show_condition?: string;
}
