import { DynamicRadioListPipe } from './dynamic-radio-list.pipe';
import { FixedListItem } from '../../../domain/definition/fixed-list-item.model';

describe('FixedRadioListPipe', () => {

  const FIXED_LIST: FixedListItem[] = [
    {
      code: 'M',
      label: 'Male',
      order: 1
    },
    {
      code: 'F',
      label: 'Female',
      order: 2
    },
    {
      code: 'O',
      label: 'Other',
      order: 3
    }
  ];
  const EMPTY = '';

  let fixedRadioListPipe: DynamicRadioListPipe;

  beforeEach(() => {
    fixedRadioListPipe = new DynamicRadioListPipe();
  });

  describe('given a value matching the code of a list item', () => {
    it('should return the associated label', () => {
      let label = fixedRadioListPipe.transform('F', FIXED_LIST);
      expect(label).toBe('Female');

      let label2 = fixedRadioListPipe.transform('M', FIXED_LIST);
      expect(label2).toBe('Male');

      let label3 = fixedRadioListPipe.transform('O', FIXED_LIST);
      expect(label3).toBe('Other');
    });
  });

  describe('given a value NOT matching the code of ANY list item', () => {
    it('should return an empty string for unknown value', () => {
      let label = fixedRadioListPipe.transform('X', FIXED_LIST);
      expect(label).toBe(EMPTY);
    });

    it('should return an empty string for undefined value', () => {
      let label = fixedRadioListPipe.transform(undefined, FIXED_LIST);
      expect(label).toBe(EMPTY);
    });

    it('should return an empty string for null value', () => {
      let label = fixedRadioListPipe.transform(null, FIXED_LIST);
      expect(label).toBe(EMPTY);
    });
  });
});
