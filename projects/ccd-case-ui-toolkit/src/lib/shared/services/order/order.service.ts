import { Injectable } from '@angular/core';
import { Orderable } from '../../domain/order/orderable.model';

// @dynamic
@Injectable()
export class OrderService {

  /**
   * @deprecated Use `sort` function instead or `compareAsc`
   */
  public sortAsc: (a:Orderable, b:Orderable)=> number = OrderService.DEFAULT_COMPARE_FUNCTION;
  private static readonly DEFAULT_COMPARE_FUNCTION = (a: Orderable, b: Orderable) => {
    const aOrdered = a.order === 0 || a.order;
    const bOrdered = b.order === 0 || b.order;

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
   * @returns Orderable[] Sorted clone array.
   */
  public sort<T extends Orderable>(array: T[], sortingFunction = this.sortAsc): T[] {
    return array
      .slice()
      .sort(sortingFunction);
  }
}
