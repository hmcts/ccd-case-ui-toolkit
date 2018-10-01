import { Injectable } from '@angular/core';
import { Orderable } from './orderable.model';

@Injectable()
export class OrderService {

  /**
   * @deprecated Use `sort` function instead or `compareAsc`
   * @type {(a:Orderable, b:Orderable)=>number}
   */
  sortAsc = OrderService.DEFAULT_COMPARE_FUNCTION;

  private static readonly DEFAULT_COMPARE_FUNCTION = (a: Orderable, b: Orderable) => {
    let aOrdered = a.order === 0 || a.order;
    let bOrdered = b.order === 0 || b.order;

    if (!aOrdered) {
      return !bOrdered ? 0 : 1;
    }

    if (!bOrdered) {
      return -1;
    }

    return a.order - b.order;
  }

  /**
   * Clone and sort array. Ascending order used by default.
   *
   * @param array Array to sort
   * @returns {Orderable[]} Sorted clone array.
   */
  sort<T extends Orderable>(array: T[], sortingFunction = this.sortAsc): T[] {
    return array
      .slice()
      .sort(sortingFunction);
  }

}
