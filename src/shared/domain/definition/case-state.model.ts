import { Orderable } from '../order';

export class CaseState implements Orderable {
  id: string;
  name: string;
  description: string;
  order?: number;
}
