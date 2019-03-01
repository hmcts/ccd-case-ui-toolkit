import { Injectable } from '@angular/core';
import { Orderable } from '../../domain/order/orderable.model';
import { CaseField, FieldType } from '../../domain';

// @dynamic
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
  };

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

  public deepSort(case_fields: CaseField[]): CaseField[] {
    case_fields.forEach((caseField: CaseField) => {
      if (caseField.isComplex()) {
        let sorted = this.deepSort(caseField.field_type.complex_fields);
        caseField.field_type.complex_fields = sorted;
      }
      if (caseField.isCollection()) {
        let sorted = this.deepSort(caseField.field_type.collection_field_type.complex_fields);
        caseField.field_type.collection_field_type.complex_fields = sorted;
      }
      if (caseField.hidden !== true && !caseField.order) {
        if (caseField.isComplex()) {
          this.deriveOrderFromChildComplexFields(caseField, caseField.field_type);
        }
        if (caseField.isCollection()) {
          this.deriveOrderFromChildComplexFields(caseField, caseField.field_type.collection_field_type);
        }
      }
    });
    return this.sort(case_fields);
  }

  private deriveOrderFromChildComplexFields(caseField: CaseField, fieldType: FieldType) {
    if (fieldType && fieldType.complex_fields && fieldType.complex_fields.length > 0) {
      let caseFieldOptional = fieldType.complex_fields.find(e => e.order !== undefined);
      if (caseFieldOptional !== undefined) {
        caseField.order = caseFieldOptional.order;
      }
    }
  }
}
