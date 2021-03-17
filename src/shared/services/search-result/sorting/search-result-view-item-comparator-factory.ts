import { Injectable } from '@angular/core';
import { SearchResultViewColumn, SearchResultViewItemComparator, SearchResultViewItem } from '../../../domain';

@Injectable()
export class SearchResultViewItemComparatorFactory {
  public static isStr(fieldValue: any): boolean {
    return typeof fieldValue === 'string' || fieldValue instanceof String
  }

  createSearchResultViewItemComparator(column: SearchResultViewColumn): SearchResultViewItemComparator {
    let fieldId = column.case_field_id;
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
    return <SearchResultViewItemComparator>{
      compare(a: SearchResultViewItem, b: SearchResultViewItem) {
        let fieldA = a.case_fields[fieldId];
        let fieldB = b.case_fields[fieldId];
        fieldA = fieldA === undefined || fieldA === null ? 0 : fieldA;
        fieldB = fieldB === undefined || fieldB === null ? 0 : fieldB;
        return fieldA - fieldB;
      }
    };
  }

  private stringComparator(fieldId: string) {
    return <SearchResultViewItemComparator>{
      compare(a: SearchResultViewItem, b: SearchResultViewItem) {
        let fieldA = a.case_fields[fieldId];
        let fieldB = b.case_fields[fieldId];
        fieldA = fieldA === undefined || fieldA === null ? '' : SearchResultViewItemComparatorFactory.isStr(fieldA) ?
          fieldA.toLowerCase() : fieldA;
        fieldB = fieldB === undefined || fieldB === null ? '' : SearchResultViewItemComparatorFactory.isStr(fieldB) ?
          fieldB.toLowerCase() : fieldB;
        return fieldA === fieldB ? 0 : fieldA > fieldB ? 1 : -1;
      }
    };
  }

  private textArrayComparator(fieldId: string) {
    return <SearchResultViewItemComparator>{
      compare(a: SearchResultViewItem, b: SearchResultViewItem) {
        let fieldA = a.case_fields[fieldId];
        let fieldB = b.case_fields[fieldId];
        fieldA = fieldA === undefined || fieldA === null ? '' : fieldA.join().toLowerCase();
        fieldB = fieldB === undefined || fieldB === null ? '' : fieldB.join().toLowerCase();
        return fieldA === fieldB ? 0 : fieldA > fieldB ? 1 : -1;
      }
    };
  }
}
