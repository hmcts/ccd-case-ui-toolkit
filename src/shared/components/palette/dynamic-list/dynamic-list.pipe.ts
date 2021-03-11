import { Pipe, PipeTransform } from '@angular/core';
import { FixedListItem } from '../../../domain/definition/fixed-list-item.model';

@Pipe({
  name: 'ccdDynamicList'
})
export class DynamicListPipe implements PipeTransform {

  private static readonly EMPTY = '';

  transform(value: string, items: FixedListItem[]): any {
    const item = items.find(i => i.code === value);
    return item ? item.label : DynamicListPipe.EMPTY;
  }

}
