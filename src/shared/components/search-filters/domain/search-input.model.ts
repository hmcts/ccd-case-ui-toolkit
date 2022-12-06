import { Orderable, Field } from '../../../domain';

export class SearchInput implements Orderable {
    constructor(
      public label: string,
      public order: number,
      public field: Field,
      public metadata?: boolean,
      public display_context_parameter?: string) {
    }
}
