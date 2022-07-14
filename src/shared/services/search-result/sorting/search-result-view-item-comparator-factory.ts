import { Injectable } from '@angular/core';
import { isUndefined } from 'util';
import { SearchResultViewColumn, SearchResultViewItem, SearchResultViewItemComparator } from '../../../domain';

@Injectable()
export class SearchResultViewItemComparatorFactory {

  public createSearchResultViewItemComparator(column: SearchResultViewColumn): SearchResultViewItemComparator {
    const fieldId = column.case_field_id;
    switch (column.case_field_type.type) {
      case ('MultiSelectList'): {
        return this.textArrayComparator(fieldId);
      }
      case ('Number'):
      case ('MoneyGBP'): {
        return this.numberComparator(fieldId);
      }
      case ('Text'):
      case ('TextArea'):
      case ('Email'):
      case ('Date'):
      case ('DateTime'):
      case ('Label'):
      case ('Postcode'):
      case ('YesOrNo'):
      case ('PhoneUK'):
      case ('FixedList'): {
        return this.stringComparator(fieldId);
      }
      default: {
        return undefined;
      }
    }
  }

  private numberComparator(fieldId: string): SearchResultViewItemComparator {
    return {
      compare(a: SearchResultViewItem, b: SearchResultViewItem) {
        let fieldA = a.case_fields[fieldId];
        let fieldB = b.case_fields[fieldId];
        fieldA = isUndefined(fieldA) || fieldA === null ? 0 : fieldA;
        fieldB = isUndefined(fieldB) || fieldB === null ? 0 : fieldB;
        return fieldA - fieldB;
      }
    } as SearchResultViewItemComparator;
  }

  private stringComparator(fieldId: string) {
    return {
      compare(a: SearchResultViewItem, b: SearchResultViewItem) {
        let fieldA = a.case_fields[fieldId];
        let fieldB = b.case_fields[fieldId];
        fieldA = isUndefined(fieldA) || fieldA == null ? '' : fieldA.toLowerCase();
        fieldB = isUndefined(fieldB) || fieldB == null ? '' : fieldB.toLowerCase();
        return fieldA === fieldB ? 0 : fieldA > fieldB ? 1 : -1;
      }
    } as SearchResultViewItemComparator;
  }

  private textArrayComparator(fieldId: string) {
    return {
      compare(a: SearchResultViewItem, b: SearchResultViewItem) {
        let fieldA = a.case_fields[fieldId];
        let fieldB = b.case_fields[fieldId];
        fieldA = isUndefined(fieldA) || fieldA == null ? '' : fieldA.join().toLowerCase();
        fieldB = isUndefined(fieldB) || fieldB == null ? '' : fieldB.join().toLowerCase();
        return fieldA === fieldB ? 0 : fieldA > fieldB ? 1 : -1;
      }
    } as SearchResultViewItemComparator;
  }
}
