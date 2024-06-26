import { Pipe, PipeTransform } from '@angular/core';
import { FixedListItem } from '../../../domain/definition/fixed-list-item.model';

@Pipe({
  name: 'ccdFixedRadioList'
})
export class FixedRadioListPipe implements PipeTransform {

  private static readonly EMPTY = '';

  public transform(value: string, items: FixedListItem[]): any {
    const item = items.find(i => i.code === value);
    return item ? item.label : FixedRadioListPipe.EMPTY;
  }
}
