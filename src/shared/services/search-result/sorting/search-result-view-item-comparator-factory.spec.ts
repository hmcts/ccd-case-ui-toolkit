import { SearchResultViewItemComparatorFactory } from './search-result-view-item-comparator-factory';
import { FieldTypeEnum, SearchResultViewColumn, FieldType, SearchResultViewItem } from '../../../domain';

describe('SearchResultViewItemComparatorFactory', () => {

  let TEST_CASE_FIELD_ID = 'TestCaseFieldId';

  describe('Number field type', () => {

    it('Should return a comparator to order numbers', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('Number'));

      expect(comparator.compare(item(69), item(69))).toBe(0);
      expect(comparator.compare(item(96), item(69))).toBe(27);
      expect(comparator.compare(item(69), item(96))).toBe(-27);

    });

    it('Should return a comparator which co-erces null or undefined field to zero', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('Number'));

      expect(comparator.compare(item(undefined), item(0))).toBe(0);
      expect(comparator.compare(item(0), item(undefined))).toBe(0);

      expect(comparator.compare(item(null), item(0))).toBe(0);
      expect(comparator.compare(item(0), item(null))).toBe(0);

    });

  });

  describe('MoneyGBP field type', () => {

    it('Should return a comparator to order numbers', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('MoneyGBP'));

      expect(comparator.compare(item(6969), item(6969))).toBe(0);
      expect(comparator.compare(item(9669), item(6969))).toBe(2700);
      expect(comparator.compare(item(6969), item(9669))).toBe(-2700);

    });

    it('Should return a comparator which co-erces null or undefined field to zero', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('MoneyGBP'));

      expect(comparator.compare(item(undefined), item(0))).toBe(0);
      expect(comparator.compare(item(0), item(undefined))).toBe(0);

      expect(comparator.compare(item(null), item(0))).toBe(0);
      expect(comparator.compare(item(0), item(null))).toBe(0);

    });

  });

  describe('Text field type', () => {

    it('Should return a comparator to order strings', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('Text'));

      expect(comparator.compare(item('cat'), item('cat'))).toBe(0);
      expect(comparator.compare(item('cat'), item('dog'))).toBe(-1);
      expect(comparator.compare(item('dog'), item('cat'))).toBe(1);

    });

    it('Should return a comparator which co-erces null or undefined field to an empty string', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('Text'));

      expect(comparator.compare(item(undefined), item(''))).toBe(0);
      expect(comparator.compare(item(''), item(undefined))).toBe(0);

      expect(comparator.compare(item(null), item(''))).toBe(0);
      expect(comparator.compare(item(''), item(null))).toBe(0);

    });

  });

  describe('TextArea field type', () => {

    it('Should return a comparator to order strings', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('TextArea'));

      expect(comparator.compare(item('cat'), item('cat'))).toBe(0);
      expect(comparator.compare(item('cat'), item('dog'))).toBe(-1);
      expect(comparator.compare(item('dog'), item('cat'))).toBe(1);

    });

    it('Should return a comparator which co-erces null or undefined field to an empty string', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('TextArea'));

      expect(comparator.compare(item(undefined), item(''))).toBe(0);
      expect(comparator.compare(item(''), item(undefined))).toBe(0);

      expect(comparator.compare(item(null), item(''))).toBe(0);
      expect(comparator.compare(item(''), item(null))).toBe(0);

    });

  });

  describe('Email field type', () => {

    it('Should return a comparator to order email addresses', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('Email'));

      expect(comparator.compare(item('cat@kitty.com'), item('cat@kitty.com'))).toBe(0);
      expect(comparator.compare(item('cat@kitty.com'), item('dog@hound.com'))).toBe(-1);
      expect(comparator.compare(item('dog@hound.com'), item('cat@kitty.com'))).toBe(1);

      expect(comparator.compare(item('cat@feline.com'), item('cat@kitty.com'))).toBe(-1);
      expect(comparator.compare(item('cat@kitty.com'), item('cat@feline.com'))).toBe(1);

    });

    it('Should return a comparator which co-erces null or undefined field to an empty string', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('Email'));

      expect(comparator.compare(item(undefined), item(''))).toBe(0);
      expect(comparator.compare(item(''), item(undefined))).toBe(0);

      expect(comparator.compare(item(null), item(''))).toBe(0);
      expect(comparator.compare(item(''), item(null))).toBe(0);

    });

  });

  describe('Postcode field type', () => {

    it('Should return a comparator to order postcodes', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('Postcode'));

      expect(comparator.compare(item('E1W 3AX'), item('E1W 3AX'))).toBe(0);
      expect(comparator.compare(item('E1W 3AX'), item('NE40 4UX'))).toBe(-1);
      expect(comparator.compare(item('NE40 4UX'), item('E1W 3AX'))).toBe(1);

    });

    it('Should return a comparator which co-erces null or undefined field to an empty string', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('Postcode'));

      expect(comparator.compare(item(undefined), item(''))).toBe(0);
      expect(comparator.compare(item(''), item(undefined))).toBe(0);

      expect(comparator.compare(item(null), item(''))).toBe(0);
      expect(comparator.compare(item(''), item(null))).toBe(0);

    });

  });

  describe('YesOrNo field type', () => {

    it('Should return a comparator to order Yes/No values', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('YesOrNo'));

      expect(comparator.compare(item('Yes'), item('Yes'))).toBe(0);
      expect(comparator.compare(item('No'), item('Yes'))).toBe(-1);
      expect(comparator.compare(item('Yes'), item('No'))).toBe(1);

    });

    it('Should return a comparator which co-erces null or undefined field to an empty string', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('YesOrNo'));

      expect(comparator.compare(item(undefined), item(''))).toBe(0);
      expect(comparator.compare(item(''), item(undefined))).toBe(0);

      expect(comparator.compare(item(null), item(''))).toBe(0);
      expect(comparator.compare(item(''), item(null))).toBe(0);

    });

  });

  describe('PhoneUK field type', () => {

    it('Should return a comparator to order UK phone numbers as text', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('PhoneUK'));

      expect(comparator.compare(item('+447989284891'), item('+447989284891'))).toBe(0);
      expect(comparator.compare(item('+447989284819'), item('07989284819'))).toBe(-1);
      expect(comparator.compare(item('07989284819'), item('+447989284819'))).toBe(1);

    });

    it('Should return a comparator which co-erces null or undefined field to an empty string', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('PhoneUK'));

      expect(comparator.compare(item(undefined), item(''))).toBe(0);
      expect(comparator.compare(item(''), item(undefined))).toBe(0);

      expect(comparator.compare(item(null), item(''))).toBe(0);
      expect(comparator.compare(item(''), item(null))).toBe(0);

    });

  });

  describe('FixedList field type', () => {

    it('Should return a comparator to order text', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('FixedList'));

      expect(comparator.compare(item('FixedListValueA'), item('FixedListValueA'))).toBe(0);
      expect(comparator.compare(item('FixedListValueA'), item('FixedListValueB'))).toBe(-1);
      expect(comparator.compare(item('FixedListValueB'), item('FixedListValueA'))).toBe(1);

    });

    it('Should return a comparator which co-erces null or undefined field to an empty string', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('FixedList'));

      expect(comparator.compare(item(undefined), item(''))).toBe(0);
      expect(comparator.compare(item(''), item(undefined))).toBe(0);

      expect(comparator.compare(item(null), item(''))).toBe(0);
      expect(comparator.compare(item(''), item(null))).toBe(0);

    });

  });

   describe('MultiSelectList field type', () => {

    it('Should return a comparator to order array items', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('MultiSelectList'));

      expect(comparator.compare(item(['London', 'Cardiff']), item(['London', 'Cardiff']))).toBe(0);
      expect(comparator.compare(item(['London', 'Cardiff']), item(['London', 'Cardiff', 'Manchester']))).toBe(-1);
      expect(comparator.compare(item(['London', 'Cardiff', 'Manchester']), item(['London', 'Cardiff']))).toBe(1);

    });

    it('Should return a comparator which co-erces a null or undefined field to an empty array', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('MultiSelectList'));

      expect(comparator.compare(item(undefined), item([]))).toBe(0);
      expect(comparator.compare(item([]), item(undefined))).toBe(0);

      expect(comparator.compare(item(null), item([]))).toBe(0);
      expect(comparator.compare(item([]), item(null))).toBe(0);

    });

  });

  describe('Date field type', () => {

    it('Should return a comparator to order dates', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('Date'));

      expect(comparator.compare(item('1954-09-25Z'), item('1954-09-25Z'))).toBe(0);
      expect(comparator.compare(item('1954-09-25Z'), item('1982-09-10Z'))).toBe(-1);
      expect(comparator.compare(item('1982-09-10Z'), item('1954-09-25Z'))).toBe(1);

    });

    it('Should return a comparator which co-erces non-existant field to an empty string', () => {

      let comparator
        = new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('Email'));

      expect(comparator.compare(item(undefined), item(''))).toBe(0);
      expect(comparator.compare(item(''), item(undefined))).toBe(0);

    });

  });

  describe('Complex field type', () => {

    it('Should return an undefined comparator', () => {

      expect(new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('Complex'))).toBe(undefined);

    });

  });

  describe('Collection field type', () => {

    it('Should return an undefined comparator', () => {

      expect(new SearchResultViewItemComparatorFactory().createSearchResultViewItemComparator(column('Collection'))).toBe(undefined);

    });

  });

  function column(type: FieldTypeEnum): SearchResultViewColumn {
    let col = new SearchResultViewColumn();
    col.case_field_id = TEST_CASE_FIELD_ID;
    col.case_field_type = new FieldType();
    col.case_field_type.type = type;
    return col;
  };

  function item(caseFieldContent: any): SearchResultViewItem {
    let searchResultViewItem = new SearchResultViewItem();
    searchResultViewItem.case_fields = new Array();
    searchResultViewItem.case_fields[TEST_CASE_FIELD_ID] = caseFieldContent;
    return searchResultViewItem;
  }

});
