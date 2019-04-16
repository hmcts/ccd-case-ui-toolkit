import { Pipe, PipeTransform } from '@angular/core';
import { DynamicListItem } from '../../../domain/definition/dynamic-list-item.model';

@Pipe({
  name: 'ccdDynamicList'
})
export class DynamicListPipe implements PipeTransform {

  private static readonly EMPTY = '';

  transform(value: string, items: DynamicListItem[]): any {
    let item = items.find(i => i.code === value);
    return item ? item.label : DynamicListPipe.EMPTY;
  }

}
