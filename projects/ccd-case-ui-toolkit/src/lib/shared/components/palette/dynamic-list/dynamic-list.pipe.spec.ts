import { FixedListItem } from '../../../domain/definition/fixed-list-item.model';
import { DynamicListPipe } from './dynamic-list.pipe';

describe('DynamicListPipe', () => {

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

  let dynamicListPipe: DynamicListPipe;

  beforeEach(() => {
    dynamicListPipe = new DynamicListPipe();
  });

  describe('given a value matching the code of a list item', () => {
    it('should return the associated label', () => {
      const label = dynamicListPipe.transform('F', FIXED_LIST);
      expect(label).toBe('Female');

      const label2 = dynamicListPipe.transform('M', FIXED_LIST);
      expect(label2).toBe('Male');

      const label3 = dynamicListPipe.transform('O', FIXED_LIST);
      expect(label3).toBe('Other');
    });
  });

  describe('given a value NOT matching the code of ANY list item', () => {
    it('should return an empty string for unknown value', () => {
      const label = dynamicListPipe.transform('X', FIXED_LIST);
      expect(label).toBe(EMPTY);
    });

    it('should return an empty string for undefined value', () => {
      const label = dynamicListPipe.transform(undefined, FIXED_LIST);
      expect(label).toBe(EMPTY);
    });

    it('should return an empty string for null value', () => {
      const label = dynamicListPipe.transform(null, FIXED_LIST);
      expect(label).toBe(EMPTY);
    });
  });
});
