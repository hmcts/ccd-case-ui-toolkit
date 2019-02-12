import { FieldType } from '../definition';

export class Field {
  constructor(
    public id: string,
    public field_type: FieldType,
    public value?: string,
    public label?: string,
    public metadata?: boolean
  ) { }
}
