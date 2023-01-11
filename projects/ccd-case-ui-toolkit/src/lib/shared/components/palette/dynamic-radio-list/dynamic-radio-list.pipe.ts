import { Pipe, PipeTransform } from '@angular/core';
import { FixedListItem } from '../../../domain/definition/fixed-list-item.model';

@Pipe({
  name: 'ccdDynamicRadioList'
})
export class DynamicRadioListPipe implements PipeTransform {

  private static readonly EMPTY = '';

  public transform(value: any, items: FixedListItem[]): any {
    /**
     *
     * If value is object with element `value.code`, use code instead.
     */
    if (value && value.value && value.value.code) {
      value = value.value.code;
    }
    const item = items.find(i => i.code === value);
    return item ? item.label : DynamicRadioListPipe.EMPTY;
  }
}
