import { FlagType } from './flag-type.model';

describe('FlagType', () => {
  it('searchPathByFlagTypeObject should return the matching FlagType object and the path to it', () => {
    const flagA1 = {
      name: 'Flag A1',
      hearingRelevant: false,
      flagComment: false,
      flagCode: 'A1',
      isParent: true,
      Path: ['Party, A'],
      childFlags: [],
      listOfValuesLength: 0,
      listOfValues: []
    };
    const flagB1 = {
      name: 'Flag B1',
      hearingRelevant: false,
      flagComment: false,
      flagCode: 'B1',
      isParent: true,
      Path: ['Party, B'],
      childFlags: [],
      listOfValuesLength: 0,
      listOfValues: []
    };

    const flagA: FlagType = {
      name: 'Flag A',
      hearingRelevant: false,
      flagComment: false,
      flagCode: 'A',
      isParent: true,
      Path: ['Party'],
      childFlags: [flagA1],
      listOfValuesLength: 0,
      listOfValues: []
    };

    const flagB: FlagType = {
      name: 'Flag B',
      hearingRelevant: false,
      flagComment: false,
      flagCode: 'B',
      isParent: true,
      Path: ['Party'],
      childFlags: [flagB1],
      listOfValuesLength: 0,
      listOfValues: []
    };

    const flags: FlagType[] = [flagA, flagB];
    const [result, path] = FlagType.searchPathByFlagTypeObject({...flagA1}, flags);

    expect(result).toEqual({...flagA1});
    expect(path).toEqual([{...flagA}]);
  });
  //
  it('searchPathByFlagTypeObject should return undefined and an empty path if no matching FlagType object is found', () => {
    const flagA1 = {
      name: 'Flag A1',
      hearingRelevant: false,
      flagComment: false,
      flagCode: 'A1',
      isParent: true,
      Path: ['Party, A'],
      childFlags: [],
      listOfValuesLength: 0,
      listOfValues: []
    };
    const flagB1 = {
      name: 'Flag B1',
      hearingRelevant: false,
      flagComment: false,
      flagCode: 'B1',
      isParent: true,
      Path: ['Party, B'],
      childFlags: [],
      listOfValuesLength: 0,
      listOfValues: []
    };

    const flagA: FlagType = {
      name: 'Flag A',
      hearingRelevant: false,
      flagComment: false,
      flagCode: 'A',
      isParent: true,
      Path: ['Party'],
      childFlags: [],
      listOfValuesLength: 0,
      listOfValues: []
    };

    const flagB: FlagType = {
      name: 'Flag B',
      hearingRelevant: false,
      flagComment: false,
      flagCode: 'B',
      isParent: true,
      Path: ['Party'],
      childFlags: [flagB1],
      listOfValuesLength: 0,
      listOfValues: []
    };
    const flags: FlagType[] = [flagA, flagB];
    const [result, path] = FlagType.searchPathByFlagTypeObject(flagA1, flags);
    expect(result).toEqual(false);
    expect(path).toEqual([]);
  });
});
