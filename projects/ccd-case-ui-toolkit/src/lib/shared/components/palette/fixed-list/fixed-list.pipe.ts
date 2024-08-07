import { Pipe, PipeTransform } from '@angular/core';
import { FixedListItem } from '../../../domain/definition/fixed-list-item.model';

@Pipe({
  name: 'ccdFixedList'
})
export class FixedListPipe implements PipeTransform {

  private static readonly EMPTY = '';

  public transform(value: string, items: FixedListItem[]): any {
    if (!!items) {
      const item = items.find(i => i.code === value);
      return item ? item.label : FixedListPipe.EMPTY;
    } else {
      return FixedListPipe.EMPTY;
    }
  }
}
