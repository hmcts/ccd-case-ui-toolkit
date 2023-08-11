// tslint:disable:variable-name
import { Orderable } from '../../../domain/order/orderable.model';
import { Field } from '../../../domain/search/field.model';

export class SearchInput implements Orderable {
  constructor(
    public label: string,
    public order: number,
    public field: Field,
    public metadata?: boolean,
    public display_context_parameter?: string) {}
}
