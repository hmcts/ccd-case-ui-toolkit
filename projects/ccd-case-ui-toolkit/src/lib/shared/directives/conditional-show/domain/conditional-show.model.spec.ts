import { waitForAsync } from '@angular/core/testing';

import { CaseField, createFieldType, FieldType } from '../../..';
import { newCaseField } from '../../../fixture';
import { ShowCondition } from './conditional-show.model';

describe('conditional-show', () => {
  // Shortened the call to create a new case field as it was getting unwieldy.
  const ncf = (id: string, label: string, fieldType: FieldType, displayContext: string): CaseField => {
    return newCaseField(id, label, null, fieldType, displayContext).build();
  };

  const caseField1: CaseField = ncf('field1', 'field1', null, 'OPTIONAL');
  const caseField2: CaseField = ncf('field2', 'field2', null, 'OPTIONAL');
  const caseField3: CaseField = ncf('field3', 'field3', null, 'OPTIONAL');
  const caseField4: CaseField = ncf('field4', 'field4', null, 'OPTIONAL');
  const addressFT: FieldType = createFieldType('AddressUK', 'AddressUK');
  const complexAddressUK: CaseField = ncf('AddressUKCode', 'Address UK', addressFT, 'OPTIONAL');
  const complexFT: FieldType = createFieldType('Complex', 'Complex', [complexAddressUK]);
  const claimantDetailsField: CaseField = ncf('claimantDetails', 'ClaimantsDetails', complexFT, 'OPTIONAL');
  const COLLECTION_OF_INTERIM_RETURNS = {
    interimReturns: [
      {
        id: '382c950a-a929-43fd-bc72-8b13d0333460',
        value: {
          bailiffName: 'petergriffin@gmail.com',
          addressAttended: {
            County: 'Cheshire',
            AddressLine1: null,
            AddressLine2: null,
            AddressLine3: null,
            PostTown: null,
            PostCode: null,
            Country: null
          },
          personToAction: 'James',
          outcomeOfVisit: null,
          dateOfVisit: null,
          typeOfContact: null
        }
      },
      {
        id: null,
        value: {
          bailiffName: 'rachelbruno@gmail.com',
          addressAttended: {
            County: 'Cornwall',
            AddressLine1: null,
            AddressLine2: null,
            AddressLine3: null,
            PostTown: null,
            PostCode: null,
            Country: null
          },
          personToAction: 'Anna',
          outcomeOfVisit: null,
          dateOfVisit: null,
          typeOfContact: null
        }
      }
    ],
    debtorFirstNames: 'John',
    debtorSurname: 'Snow'
  };
  const contextFields = [caseField1, caseField2, caseField3, caseField4, claimantDetailsField];

  describe('matches when', () => {
    it('empty condition', () => {
      const sc = new ShowCondition('');
      const fields = {
        field : 's1'
      };
      const matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('dynamic list show condition', () => {
      const sc = new ShowCondition('field="List3"');
      const fields = {
        field : { value: {code: 'List3', label: 'List 3'},
        list_items: [{code: 'List1', label: 'List 2'},
          {code: 'List2', label: 'List 3'},
          {code: 'List3', label: 'List 3'}]
      }
      };
      const matched = sc.match(fields);
      expect(matched).toBe(true);
    });

    it('field has expected value', () => {
      const sc = new ShowCondition('field="s1"');
      const fields = {
        field : 's1'
      };
      const matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('field has expected value and is a number', () => {
      const sc = new ShowCondition('field="3"');
      const fields = {
        field : 3
      };
      const matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('field starts with a string', () => {
      const sc = new ShowCondition('field="te*"');
      const fields = {
        field : 'test'
      };
      const matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('should return true when multiple values match exactly', () => {
      const sc = new ShowCondition('field="s1,s2"');
      const fields = {
        field : ['s1', 's2']
      };

      const matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('should return true when multiple values match exactly regardless of the order', () => {
      const sc = new ShowCondition('field="s2,s3,s1"');
      const fields = {
        field : ['s3', 's1', 's2']
      };

      const matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('should return true when value will match exactly on a complex field', () => {
      const sc = new ShowCondition('claimantDetails.NamePrefix="Mr."');
      const fields = {
        claimantDetails: {
          NamePrefix: 'Mr.'
        }
      };

      const matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('should return true when value will match exactly on AddressUK complex field', () => {
      const sc = new ShowCondition('claimantDetails.AddressUKCode.PostTown="London"');
      const fields = {
        solicitorName: 'Ben Kember',
        claimantDetails: {
          NamePrefix: 'Mr.',
          FirstName: 'John',
          LastName: 'Snow',
          AddressUKCode: {
            AddressLine1: '3rd Floor, Mitre House',
            AddressLine2: '177 Regent Street',
            AddressLine3: 'London',
            PostTown: 'London',
            County: 'Middlesex',
            PostCode: 'E17 7QN',
            Country: 'United Kingdom'
          }
        }
      };

      const matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('should return true when value will match on a collection element with a complex field', () => {
      const sc = new ShowCondition('interimReturns.addressAttended.County="Cornwall"');

      const fields = COLLECTION_OF_INTERIM_RETURNS;
      const path = 'interimReturns_1_outcomeOfVisit'; // path tells the matcher we will match against the element with index 1
      const matched = sc.match(fields, path);

      expect(matched).toBe(true);
    });

    it('field starts with a string and has empty value', () => {
      const sc = new ShowCondition('claimantDetails.NamePrefix=""');
      const fields = {
        claimantDetails: {
          NamePrefix: ''
        }
      };

      const matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('should check empty path name condition', () => {
      const sc = new ShowCondition('');

      expect(sc['updatePathName']('')).toEqual('');
    });

    it('should check path name for complex with collection field', () => {
      const sc = new ShowCondition('');

      expect(sc['updatePathName']('ComplexWithCollectionFieldShowCondition1_CollectionItems')).toEqual('ComplexWithCollectionFieldShowCondition1_CollectionItems');
    });

    it('should check complex collection items path name', () => {
      const sc = new ShowCondition('');

      expect(sc['updatePathName']('CollectionItems_0_0')).toEqual('CollectionItems_CollectionItems_0');
    });

  });

  describe('matchByContextFields when', () => {
    beforeEach(waitForAsync(() => {
      caseField1.value = 's1';
      caseField2.value = 3;
      caseField3.value = 'temmy';
      caseField4.value = 's1 AND s2';
      complexAddressUK.value = {
        AddressLine1: '3rd Floor, Mitre House',
        AddressLine2: '177 Regent Street',
        AddressLine3: 'London',
        PostTown: 'London',
        County: 'Middlesex',
        PostCode: 'E17 7QN',
        Country: 'United Kingdom'
      };
    }));

    it('empty condition', () => {
      const sc = new ShowCondition('');
      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('field has expected value', () => {
      const sc = new ShowCondition('field1="s1"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('field has expected value and is a number', () => {
      const sc = new ShowCondition('field2="3"');
      const matched = sc.matchByContextFields(contextFields);
      expect(matched).toBe(true);
    });

    it('field starts with a string', () => {
      const sc = new ShowCondition('field3="te*"');
      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return true when multiple values match exactly', () => {
      caseField1.value = ['s1', 's2'];
      const sc = new ShowCondition('field1="s1,s2"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return true when multiple values match exactly regardless of the order', () => {
      caseField1.value = ['s2' , 's1'];
      const sc = new ShowCondition('field1="s1,s2"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return true when complex values match exactly', () => {
      const sc = new ShowCondition('claimantDetails.AddressUKCode.PostTown="London"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });
  });

  describe('not matches when', () => {
    it('field value is not equal to condition', () => {
      const sc = new ShowCondition('field="test"');
      const fields = {
        field : 'test1'
      };
      const matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field value does not start with the condition string', () => {
      const sc = new ShowCondition('field="te*"');
      const fields = {
        field : 'yest'
      };
      const matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field starts with a string and does not exist', () => {
      const sc = new ShowCondition('field="te*"');
      const fields = {
      };
      const matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field starts with a string and does not exist', () => {
      const sc = new ShowCondition('claimantDetails.NamePrefix="Mr."');
      const fields = {
        claimantDetails: {
          OtherPrefix: 'Mr.'
        }
      };

      const matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('should return false when multiple values does not match exactly', () => {
      const sc = new ShowCondition('field="s1,s2"');
      const fields = {
        field : ['s1', 's2' , 's3']
      };

      const matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field mentioned in condition has no value asked in EQUALS condition', () => {
      const sc = new ShowCondition('field="test"');
      const fields = {
        field : undefined
      };
      const matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field mentioned in multi value condition has no value asked in EQUALS condition', () => {
      const sc = new ShowCondition('field="test,pest"');
      const fields = {
        field : undefined
      };
      const matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field mentioned in condition has no value asked in CONTAINS condition', () => {
      const sc = new ShowCondition('fieldCONTAINS"test,mest"');
      const fields = {
        field : []
      };
      const matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field mentioned in condition has no value', () => {
      const sc = new ShowCondition('fieldCONTAINS"test,mest"');
      const fields = {
        field : undefined
      };
      const matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field mentioned in single value condition has no value', () => {
      const sc = new ShowCondition('fieldCONTAINS"test"');
      const fields = {
        field : undefined
      };
      const matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('invalid field mentioned in complex field condition', () => {
      const sc = new ShowCondition('claimantDetails.InvalidField="Mr."');
      const fields = {
        claimantDetails: {
          NamePrefix: 'Mr.'
        }
      };

      const matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field mentioned in complex field condition has no value', () => {
      const sc = new ShowCondition('claimantDetails.NamePrefix="Mr."');
      const fields = {
        claimantDetails: {
          NamePrefix: undefined
        }
      };

      const matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('should return false when value will not match on a collection element with a complex field', () => {
      const sc = new ShowCondition('interimReturns.addressAttended.County="Cornwall"');

      const fields = COLLECTION_OF_INTERIM_RETURNS;
      const path = 'interimReturns_0_outcomeOfVisit'; // path tells the matcher we will match against the element with index 0
      const matched = sc.match(fields, path);

      expect(matched).toBe(false);
    });

    it('should return false when the provided path collection number is invalid', () => {
      const sc = new ShowCondition('interimReturns.addressAttended.County="Cornwall"');

      const fields = COLLECTION_OF_INTERIM_RETURNS;
      const path = 'interimReturns_wrongNumber_outcomeOfVisit'; // we provide invalid element index
      const matched = sc.match(fields, path);

      expect(matched).toBe(false);
    });

    it('should return false when the provided path is broken', () => {
      const sc = new ShowCondition('interimReturns.addressAttended.County="Cornwall"');

      const fields = COLLECTION_OF_INTERIM_RETURNS;
      const path = 'nonMatchingField_0_outcomeOfVisit';
      const matched = sc.match(fields, path);

      expect(matched).toBe(false);
    });

  });

  describe('not matches ByContextFields when', () => {
    beforeEach(waitForAsync(() => {
      caseField1.value = 's1';
      caseField2.value = 3;
      caseField3.value = 'temmy';
      caseField4.value = 's1 AND s2';
      complexAddressUK.value = {
        AddressLine1: '3rd Floor, Mitre House',
        AddressLine2: '177 Regent Street',
        AddressLine3: 'London',
        PostTown: 'London',
        County: 'Middlesex',
        PostCode: 'E17 7QN',
        Country: 'United Kingdom'
      };
    }));

    it('field value is not equal to condition', () => {
      const sc = new ShowCondition('field1="test"');
      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });

    it('field value does not start with ' +
      'the condition string', () => {
      const sc = new ShowCondition('field1="te*"');
      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });

    it('should return false when multiple values does not match exactly', () => {
      caseField1.value = ['s2', 's1', 's3'];
      const sc = new ShowCondition('field1="s1,s2"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });

    it('should return false when values does not exist', () => {
      caseField1.value = undefined;
      const sc = new ShowCondition('field1="s1,s2"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });
    it('should return true when complex values match exactly', () => {
      const sc = new ShowCondition('claimantDetails.AddressUKCode="London"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });
  });

  describe('multiple AND conditions', () => {
    beforeEach(waitForAsync(() => {
      caseField1.value = 's1';
      caseField2.value = 3;
      caseField3.value = 'temmy';
      caseField4.value = 's1 AND s2';
      complexAddressUK.value = {
        AddressLine1: '3rd Floor, Mitre House',
        AddressLine2: '177 Regent Street',
        AddressLine3: 'London',
        PostTown: 'London',
        County: 'Middlesex',
        PostCode: 'E17 7QN',
        Country: 'UK'
      };
    }));

    it('should return true when all conditions are true', () => {
      caseField1.value = ['s1', 's2', 's3'];
      const sc = new ShowCondition('field1CONTAINS"s3,s2" AND field2=3 AND field3="te*" AND field4="s1 AND s2"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return false when any condition is false', () => {
      const sc = new ShowCondition('field1="s1" AND field2=3 AND field3="no-match"');
      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });

    it('should evaluate AND conditions correctly when AND keyword is present in the value being matched', () => {
      const sc = new ShowCondition('field4="s1 AND s2" AND field2=3');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should evaluate AND conditions correctly for a mix of EQUALS and CONTAINS', () => {
      caseField2.value = ['s4', 's2', 's3'];
      const sc = new ShowCondition('field4="s1 AND s2" AND field2CONTAINS"s3,s4"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return true when all conditions are true when using Complex fields', () => {
      caseField1.value = ['s1', 's2', 's3'];
      const sc = new ShowCondition(
        'field1CONTAINS"s3,s2" AND claimantDetails.AddressUKCode.PostTown="London" AND claimantDetails.AddressUKCode.Country="UK"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });
  });

  describe('CONTAINS expression variations', () => {
    beforeEach(waitForAsync(() => {
      caseField1.value = ['s1'];
      caseField2.value = 3;
      caseField3.value = 'temmy';
      caseField4.value = 's1 AND s2';
    }));

    it('should return true when single value matches ', () => {
      const sc = new ShowCondition('field1CONTAINS"s1"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return true when values match', () => {
      caseField1.value = ['s1', 's2', 's3'];
      const sc = new ShowCondition('field1CONTAINS"s1,s3"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return true when value match regardless of order', () => {
      caseField1.value = ['s3', 's1', 's2'];
      const sc = new ShowCondition('field1CONTAINS"s2,s1"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return false when values do not match', () => {
      caseField1.value = ['s1', 's2', 's3'];
      const sc = new ShowCondition('field1CONTAINS"s1,s4"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });

    it('should return true when single value condition matches', () => {
      caseField1.value = ['s1', 's2', 's3'];
      const sc = new ShowCondition('field1CONTAINS"s3"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return false for non multi select fields', () => {
      const sc = new ShowCondition('field3CONTAINS"temmy"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });

    it('should return false when value does not exist', () => {
      caseField1.value = undefined;
      const sc = new ShowCondition('field1CONTAINS"s1,s4"');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });

    it('should return true when multiple CONTAINS condition matches when using Complex field with AND and OR condition', () => {
      complexAddressUK.value = {
        County: ['Middlesex', 'London'],
      };
      caseField1.value = ['s1', 's2', 's3'];
      const sc = new ShowCondition('field1CONTAINS"s1,s3" AND (claimantDetails.AddressUKCode.CountyCONTAINS"Middlesex" OR claimantDetails.AddressUKCode.CountyCONTAINS"London")');

      const matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });
  });

  describe('addPathPrefixToCondition()', () => {
    it('should not add path return condition as is when no path prefix available', () => {
      expect(ShowCondition.addPathPrefixToCondition('field1="test"', '')).toBe('field1="test"');
    });

    it('should not add path return condition as is when null path prefix available', () => {
      expect(ShowCondition.addPathPrefixToCondition('field1="test"', null)).toBe('field1="test"');
    });

    it('should return null when null path prefix and empty condition available', () => {
      expect(ShowCondition.addPathPrefixToCondition(null, '')).toBe(null);
    });

    it('should return null when null path prefix and null condition available', () => {
      expect(ShowCondition.addPathPrefixToCondition(null, null)).toBe(null);
    });

    it('should return empty string when empty path prefix and empty condition available', () => {
      expect(ShowCondition.addPathPrefixToCondition('', '')).toBe('');
    });

    it('should add path with combination of AND/OR available in condition scenario-1', () => {
      expect(ShowCondition.addPathPrefixToCondition('(field1CONTAINS"s1" OR field1=3 OR field1!="field 1") AND (ield="field1" OR field=10)', 'ComplexField1.AddressLine1')).
      toBe('(ComplexField1.AddressLine1.field1CONTAINS"s1" OR ComplexField1.AddressLine1.field1=3 OR ComplexField1.AddressLine1.field1!="field 1") AND (ComplexField1.AddressLine1.ield="field1" OR ComplexField1.AddressLine1.field=10)');
    });

    it('should add path with combination of AND/OR available in condition scenario-2', () => {
      expect(ShowCondition.addPathPrefixToCondition('field1CONTAINS"S3,S2" AND (field2=3 OR field3="te*" OR field4="S1 AND S2")', 'ComplexField1.AddressLine1')).
      toBe('ComplexField1.AddressLine1.field1CONTAINS"S3,S2" AND (ComplexField1.AddressLine1.field2=3 OR ComplexField1.AddressLine1.field3="te*" OR ComplexField1.AddressLine1.field4="S1 AND S2")');
    });

    it('should add path with combination of AND/OR available in condition scenario-3', () => {
      expect(ShowCondition.addPathPrefixToCondition('field1CONTAINS"S3,S2" AND (field2=3 OR field3="te*") AND field4="S1 AND S2"', 'ComplexField1.AddressLine1')).
      toBe('ComplexField1.AddressLine1.field1CONTAINS"S3,S2" AND (ComplexField1.AddressLine1.field2=3 OR ComplexField1.AddressLine1.field3="te*") AND ComplexField1.AddressLine1.field4="S1 AND S2"');
    });

    it('should add path with combination of AND/OR available in condition scenario-4', () => {
      expect(ShowCondition.addPathPrefixToCondition('(field1CONTAINS"s1" OR field1CONTAINS"s2" OR field2!="field 1") AND (ieldCONTAINS"field1" OR field=10)', 'ComplexField1.AddressLine1')).
      toBe('(ComplexField1.AddressLine1.field1CONTAINS"s1" OR ComplexField1.AddressLine1.field1CONTAINS"s2" OR ComplexField1.AddressLine1.field2!="field 1") AND (ComplexField1.AddressLine1.ieldCONTAINS"field1" OR ComplexField1.AddressLine1.field=10)');
    });

    it('should not add path with when already path prefixed', () => {
      expect(ShowCondition.addPathPrefixToCondition('ComplexField1.AddressLine1.field1CONTAINS"S3,S2" AND (ComplexField1.AddressLine1.field2=3 OR ComplexField1.AddressLine1.field3="te*") AND ComplexField1.AddressLine1.field4="S1 AND S2"', 'ComplexField1.AddressLine1')).
      toBe('ComplexField1.AddressLine1.field1CONTAINS"S3,S2" AND (ComplexField1.AddressLine1.field2=3 OR ComplexField1.AddressLine1.field3="te*") AND ComplexField1.AddressLine1.field4="S1 AND S2"');
    });

    it('should add path with simple condition', () => {
      expect(ShowCondition.addPathPrefixToCondition('field1CONTAINS"s1"',
        'ComplexField1.AddressLine1')).toBe('ComplexField1.AddressLine1.field1CONTAINS"s1"');
    });

    it('should add path with simple AND condition', () => {
      expect(ShowCondition.addPathPrefixToCondition('field1="test" AND field2CONTAINS"s1"', 'ComplexField1.AddressLine1'))
      .toBe('ComplexField1.AddressLine1.field1="test" AND ComplexField1.AddressLine1.field2CONTAINS"s1"');
    });
  });

  describe('NOT EQUALS', () => {
    it('Scenario1 show: comparator match with specific value', () => {
      const sc = new ShowCondition('field!="MOJ"');
      const fields = {
        field: 'Reform'
      };
      const matched = sc.match(fields);
      expect(matched).toBe(true);
    });
    it('Scenario2 show: is not blank', () => {
      const sc = new ShowCondition('field!=""');
      const fields = {
        field: 'MOJ'
      };
      const matched = sc.match(fields);
      expect(matched).toBe(true);
    });
    it('Scenario2 hide: is not blank', () => {
      const sc = new ShowCondition('field!=""');
      const fields = {
        field: '    '
      };
      const matched = sc.match(fields);
      expect(matched).toBe(false);
    });
    it('Scenario2 hide: is not blank with null value', () => {
      const sc = new ShowCondition('field!=""');
      const fields = {
        field: null
      };
      const matched = sc.match(fields);
      expect(matched).toBe(false);
    });
    it('Scenario2 hide: is not blank with showCondition multiple spaces', () => {
      const sc = new ShowCondition('field!="  "');
      const fields = {
        field: null
      };
      const matched = sc.match(fields);
      expect(matched).toBe(false);
    });
    it('Scenario3 hide: has any value', () => {
      const sc = new ShowCondition('field!="*"');
      const fields = {
        field: 'MOJ'
      };
      const matched = sc.match(fields);
      expect(matched).toBe(false);
    });
    it('Scenario4 hide: comparator does not match value', () => {
      const sc = new ShowCondition('field!="Reform"');
      const fields = {
        field: 'Reform'
      };
      const matched = sc.match(fields);
      expect(matched).toBe(false);
    });
    it('Scenario4 hide: multi select not equals', () => {
      const sc = new ShowCondition('field!="s1,s2"');
      const fields = {
        field: ['s1', 's2']
      };

      const matched = sc.match(fields);

      expect(matched).toBe(false);
    });
    describe('OR conditional tests', () => {
      it('Scenario1: OR condition', () => {
        const sc = new ShowCondition('field1="field1NoMatchValue" OR field2="field2NoMatchValue" OR field3="field3NoMatchValue"');
        const matched = sc.matchByContextFields(contextFields);
        expect(matched).toBe(false);
      });
      it('Scenario2 positive: OR logic with equals', () => {
        const sc = new ShowCondition('field1="field1Value" OR field2=3 OR field3="no-match"');
        contextFields[1].value = 3;
        const matched = sc.matchByContextFields(contextFields);
        expect(matched).toBe(true);
      });
      it('Scenario2 positive: OR logic with not equals', () => {
        const sc = new ShowCondition('field1!="field1Value" OR field2=3 OR field3="no-match"');
        const matched = sc.matchByContextFields(contextFields);
        expect(matched).toBe(true);
      });
      it('OR condition mixed with AND => equals condition', () => {
        const sc = new ShowCondition('field1="field1NoMatchValue" OR field2="field2NoMatchValue" AND field3="field3NoMatchValue"');
        const matched = sc.matchByContextFields(contextFields);
        expect(matched).toBe(false);
      });
      it('OR condition mixed with AND => not equals condition', () => {
        const sc = new ShowCondition('field1!="field1NoMatchValue" OR (field2="field2NoMatchValue" AND field3="field3NoMatchValue")');
        const matched = sc.matchByContextFields(contextFields);
        expect(matched).toBe(true);
      });
      it('AND condition mixed with OR => equals condition', () => {
        const sc = new ShowCondition('field1="field1NoMatchValue" AND (field2="field2NoMatchValue" OR field3="field3NoMatchValue")');
        const matched = sc.matchByContextFields(contextFields);
        expect(matched).toBe(false);
      });
      it('AND condition mixed with OR => not equals condition', () => {
        const sc = new ShowCondition('field1!="field1NoMatchValue" AND (field2="field2NoMatchValue" OR field3="field3NoMatchValue")');
        const matched = sc.matchByContextFields(contextFields);
        expect(matched).toBe(false);
      });
    });
  });

  describe('static hiddenCannotChange', () => {
    const FIELDS = {
      OPTIONAL: ncf('optional', 'Optional', null, 'OPTIONAL'),
      MANDATORY: ncf('mandatory', 'Mandatory', null, 'MANDATORY'),
      READONLY: ncf('readonly', 'Read-only', null, 'READONLY'),
      HIDDEN: ncf('hidden', 'Hidden', null, 'HIDDEN')
    };
    const FIELDS_ARRAY = [ FIELDS.OPTIONAL, FIELDS.MANDATORY, FIELDS.READONLY, FIELDS.HIDDEN ];

    describe('should return false when', () => {
      it('the parameters are null', () => {
        const result = ShowCondition.hiddenCannotChange(null, null);
        expect(result).toBe(false);
      });

      it('ShowCondition is null', () => {
        const result = ShowCondition.hiddenCannotChange(null, FIELDS_ARRAY);
        expect(result).toBe(false);
      });

      it('ShowCondition is undefined', () => {
        const result = ShowCondition.hiddenCannotChange(undefined, FIELDS_ARRAY);
        expect(result).toBe(false);
      });

      it('caseFields is null', () => {
        const showCondition: ShowCondition = new ShowCondition(`${FIELDS.OPTIONAL.id}="Bob"`);
        const result = ShowCondition.hiddenCannotChange(showCondition, null);
        expect(result).toBe(false);
      });

      it('caseFields is undefined', () => {
        const showCondition: ShowCondition = new ShowCondition(`${FIELDS.OPTIONAL.id}="Bob"`);
        const result = ShowCondition.hiddenCannotChange(showCondition, undefined);
        expect(result).toBe(false);
      });

      it('there is no show_condition', () => {
        const showCondition = new ShowCondition('');
        const result = ShowCondition.hiddenCannotChange(showCondition, FIELDS_ARRAY);
        expect(result).toBe(false);
      });

      it('the dependent field is OPTIONAL', () => {
        const showCondition: ShowCondition = new ShowCondition(`${FIELDS.OPTIONAL.id}="Bob"`);
        const result = ShowCondition.hiddenCannotChange(showCondition, FIELDS_ARRAY);
        expect(result).toBe(false);
      });

      it('the dependent field is MANDATORY', () => {
        const showCondition: ShowCondition = new ShowCondition(`${FIELDS.MANDATORY.id}="Bob"`);
        const result = ShowCondition.hiddenCannotChange(showCondition, FIELDS_ARRAY);
        expect(result).toBe(false);
      });

      it('at least one dependent field is OPTIONAL', () => {
        const optional = `${FIELDS.OPTIONAL.id}="Bob"`;
        const readonly = `${FIELDS.READONLY.id}="Bob"`;
        const showCondition: ShowCondition = new ShowCondition(`${optional} AND ${readonly}`);
        const result = ShowCondition.hiddenCannotChange(showCondition, FIELDS_ARRAY);
        expect(result).toBe(false);
      });

      it('at least one dependent field is MANDATORY', () => {
        const mandatory = `${FIELDS.MANDATORY.id}="Bob"`;
        const hidden = `${FIELDS.HIDDEN.id}="Bob"`;
        const showCondition: ShowCondition = new ShowCondition(`${hidden} AND ${mandatory}`);
        const result = ShowCondition.hiddenCannotChange(showCondition, FIELDS_ARRAY);
        expect(result).toBe(false);
      });

      it('dependent field is nested within Complex field and OPTIONAL', () => {
        const complexFieldType = createFieldType('Complex', 'Complex', [ FIELDS.OPTIONAL ]);
        const complexField = ncf('complex', 'Complex', complexFieldType, 'OPTIONAL');
        const showCondition: ShowCondition = new ShowCondition(`${complexField.id}.${FIELDS.OPTIONAL.id}="Bob"`);
        const SPECIFIC_FIELDS = [ complexField ];
        const result = ShowCondition.hiddenCannotChange(showCondition, SPECIFIC_FIELDS);
        expect(result).toBe(false);
      });
    });

    describe('should return true when', () => {
      it('the dependent field is READONLY', () => {
        const showCondition: ShowCondition = new ShowCondition(`${FIELDS.READONLY.id}="Bob"`);
        const result = ShowCondition.hiddenCannotChange(showCondition, FIELDS_ARRAY);
        expect(result).toBe(true);
      });

      it('the dependent field is HIDDEN', () => {
        const showCondition: ShowCondition = new ShowCondition(`${FIELDS.HIDDEN.id}="Bob"`);
        const result = ShowCondition.hiddenCannotChange(showCondition, FIELDS_ARRAY);
        expect(result).toBe(true);
      });

      it('ALL dependent fields are HIDDEN or READONLY', () => {
        const hidden = `${FIELDS.HIDDEN.id}="Bob"`;
        const readonly = `${FIELDS.READONLY.id}="Bob"`;
        const showCondition: ShowCondition = new ShowCondition(`${hidden} AND ${readonly}`);
        const result = ShowCondition.hiddenCannotChange(showCondition, FIELDS_ARRAY);
        expect(result).toBe(true);
      });

      it('dependent field is nested within Complex field and HIDDEN', () => {
        const complexFieldType = createFieldType('Complex', 'Complex', [ FIELDS.HIDDEN ]);
        const complexField = ncf('complex', 'Complex', complexFieldType, 'OPTIONAL');
        const showCondition: ShowCondition = new ShowCondition(`${complexField.id}.${FIELDS.HIDDEN.id}="Bob"`);
        const SPECIFIC_FIELDS = [ complexField ];
        const result = ShowCondition.hiddenCannotChange(showCondition, SPECIFIC_FIELDS);
        expect(result).toBe(true);
      });

      it('dependent field is nested within Complex field that ITSELF is HIDDEN', () => {
        const complexFieldType = createFieldType('Complex', 'Complex', [ FIELDS.OPTIONAL ]);
        const complexField = ncf('complex', 'Complex', complexFieldType, 'HIDDEN');
        const showCondition: ShowCondition = new ShowCondition(`${complexField.id}.${FIELDS.OPTIONAL.id}="Bob"`);
        const SPECIFIC_FIELDS = [ complexField ];
        const result = ShowCondition.hiddenCannotChange(showCondition, SPECIFIC_FIELDS);
        expect(result).toBe(true);
      });

      it('dependent field is nested within Complex Collection field and HIDDEN', () => {
        const complexFieldType = createFieldType('Complex', 'Complex', [ FIELDS.HIDDEN ]);
        const collectionFieldType = createFieldType('Collection', 'Collection', [], complexFieldType);
        const collectionField = ncf('collection', 'Collection', collectionFieldType, 'OPTIONAL');
        const showCondition: ShowCondition = new ShowCondition(`${collectionField.id}.${FIELDS.HIDDEN.id}="Bob"`);
        const SPECIFIC_FIELDS = [ collectionField ];
        const result = ShowCondition.hiddenCannotChange(showCondition, SPECIFIC_FIELDS);
        expect(result).toBe(true);
      });

      it('dependent field is nested within Complex Collection field that ITSELF is HIDDEN', () => {
        const complexFieldType = createFieldType('Complex', 'Complex', [ FIELDS.OPTIONAL ]);
        const collectionFieldType = createFieldType('Collection', 'Collection', [], complexFieldType);
        const collectionField = ncf('collection', 'Collection', collectionFieldType, 'HIDDEN');
        const showCondition: ShowCondition = new ShowCondition(`${collectionField.id}.${FIELDS.OPTIONAL.id}="Bob"`);
        const SPECIFIC_FIELDS = [ collectionField ];
        const result = ShowCondition.hiddenCannotChange(showCondition, SPECIFIC_FIELDS);
        expect(result).toBe(true);
      });

      it('caseFields is empty', () => {
        const showCondition: ShowCondition = new ShowCondition(`${FIELDS.OPTIONAL.id}="Bob"`);
        const result = ShowCondition.hiddenCannotChange(showCondition, []);
        expect(result).toBe(true);
      });

      it('dependent field does not exist in caseFields', () => {
        const showCondition: ShowCondition = new ShowCondition(`${FIELDS.READONLY.id}="Bob"`);
        const SPECIFIC_FIELDS = [ FIELDS.HIDDEN ];
        const result = ShowCondition.hiddenCannotChange(showCondition, SPECIFIC_FIELDS);
        expect(result).toBe(true);
      });

      it('dependent field does not exist within Complex field', () => {
        const complexFieldType = createFieldType('Complex', 'Complex', [ FIELDS.OPTIONAL ]);
        const complexField = ncf('complex', 'Complex', complexFieldType, 'OPTIONAL');
        const showCondition: ShowCondition = new ShowCondition(`${complexField.id}.${FIELDS.MANDATORY.id}="Bob"`);
        // Complex field contains OPTIONAL, we're looking for MANDTORY.
        const SPECIFIC_FIELDS = [ complexField ];
        const result = ShowCondition.hiddenCannotChange(showCondition, SPECIFIC_FIELDS);
        expect(result).toBe(true);
      });

      it('dependent field does not exist within Complex Collection field', () => {
        const complexFieldType = createFieldType('Complex', 'Complex', [ FIELDS.OPTIONAL ]);
        const collectionFieldType = createFieldType('Collection', 'Collection', [], complexFieldType);
        const collectionField = ncf('collection', 'Collection', collectionFieldType, 'OPTIONAL');
        const showCondition: ShowCondition = new ShowCondition(`${collectionField.id}.${FIELDS.MANDATORY.id}="Bob"`);
        // Complex Collection contains OPTIONAL, we're looking for MANDTORY.
        const SPECIFIC_FIELDS = [ collectionField ];
        const result = ShowCondition.hiddenCannotChange(showCondition, SPECIFIC_FIELDS);
        expect(result).toBe(true);
      });
    });
  });

  /**
   * Specifically make sure the static method is called by the instance method and
   * that it passes the same parameters. We only need one test like this as all the
   * other scenarios are covered by invoking the static method.
   */
  describe('instance hiddenCannotChange', () => {
    const READONLY_FIELD = ncf('readonly', 'Read-only', null, 'READONLY');
    const FIELDS = [ READONLY_FIELD ];

    it('should call static method with appropriate parameters', () => {
      spyOn(ShowCondition, 'hiddenCannotChange');
      const instance: ShowCondition = new ShowCondition(`${READONLY_FIELD.id}="Bob"`);
      instance.hiddenCannotChange(FIELDS);
      expect(ShowCondition.hiddenCannotChange).toHaveBeenCalledWith(instance, FIELDS);
    });
  });
});
