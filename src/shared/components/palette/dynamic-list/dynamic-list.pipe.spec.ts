import { DynamicListPipe } from './dynamic-list.pipe';
import { DynamicListItem } from '../../../domain/definition/dynamic-list-item.model';

describe('DynamicListPipe', () => {

  const DYNAMIC_LIST: DynamicListItem[] = [
    {
      code: 'M',
      label: 'Male'
    },
    {
      code: 'F',
      label: 'Female'
    },
    {
      code: 'O',
      label: 'Other'
    }
  ];
  const EMPTY = '';

  let dynamicListPipe: DynamicListPipe;

  beforeEach(() => {
    dynamicListPipe = new DynamicListPipe();
  });

  describe('given a value matching the code of a list item', () => {
    it('should return the associated label', () => {
      let label = dynamicListPipe.transform('F', DYNAMIC_LIST);
      expect(label).toBe('Female');

      let label2 = dynamicListPipe.transform('M', DYNAMIC_LIST);
      expect(label2).toBe('Male');

      let label3 = dynamicListPipe.transform('O', DYNAMIC_LIST);
      expect(label3).toBe('Other');
    });
  });

  describe('given a value NOT matching the code of ANY list item', () => {
    it('should return an empty string for unknown value', () => {
      let label = dynamicListPipe.transform('X', DYNAMIC_LIST);
      expect(label).toBe(EMPTY);
    });

    it('should return an empty string for undefined value', () => {
      let label = dynamicListPipe.transform(undefined, DYNAMIC_LIST);
      expect(label).toBe(EMPTY);
    });

    it('should return an empty string for null value', () => {
      let label = dynamicListPipe.transform(null, DYNAMIC_LIST);
      expect(label).toBe(EMPTY);
    });
  });
});
