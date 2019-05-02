import { ShowCondition } from './conditional-show.model';
import { async } from '@angular/core/testing';
import { aCaseField, CaseField } from '../../..';

describe('conditional-show', () => {
  let caseField1: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
  let caseField2: CaseField = aCaseField('field2', 'field2', 'Text', 'OPTIONAL', null);
  let caseField3: CaseField = aCaseField('field3', 'field3', 'Text', 'OPTIONAL', null);
  let caseField4: CaseField = aCaseField('field4', 'field4', 'Text', 'OPTIONAL', null);
  let complexAddressUK: CaseField = aCaseField('AddressUKCode', 'Address UK', 'AddressUK', 'OPTIONAL', null);
  let claimantDetailsField: CaseField = aCaseField('claimantDetails', 'ClaimantsDetails', 'Complex', 'OPTIONAL', null, [complexAddressUK]);
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

  let contextFields = [caseField1, caseField2, caseField3, caseField4, claimantDetailsField];

  describe('matches when', () => {
    it('empty condition', () => {
      let sc = new ShowCondition('');
      let fields = {
        field : 's1'
      };
      let matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('field has expected value', () => {
      let sc = new ShowCondition('field="s1"');
      let fields = {
        field : 's1'
      };
      let matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('field has expected value and is a number', () => {
      let sc = new ShowCondition('field="3"');
      let fields = {
        field : 3
      };
      let matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('field starts with a string', () => {
      let sc = new ShowCondition('field="te*"');
      let fields = {
        field : 'test'
      };
      let matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('should return true when multiple values match exactly', () => {
      let sc = new ShowCondition('field="s1,s2"');
      let fields = {
        field : ['s1', 's2']
      };

      let matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('should return true when multiple values match exactly regardless of the order', () => {
      let sc = new ShowCondition('field="s2,s3,s1"');
      let fields = {
        field : ['s3', 's1', 's2']
      };

      let matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('should return true when value will match exactly on a complex field', () => {
      let sc = new ShowCondition('claimantDetails.NamePrefix="Mr."');
      let fields = {
        claimantDetails: {
          NamePrefix: 'Mr.'
        }
      };

      let matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('should return true when value will match exactly on AddressUK complex field', () => {
      let sc = new ShowCondition('claimantDetails.AddressUKCode.PostTown="London"');
      let fields = {
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

      let matched = sc.match(fields);

      expect(matched).toBe(true);
    });

    it('should return true when value will match on a collection element with a complex field', () => {
      let sc = new ShowCondition('interimReturns.addressAttended.County="Cornwall"');

      let fields = COLLECTION_OF_INTERIM_RETURNS;
      let path = 'interimReturns_1_outcomeOfVisit'; // path tells the matcher we will match against the element with index 1
      let matched = sc.match(fields, path);

      expect(matched).toBe(true);
    });

  });

  describe('matchByContextFields when', () => {
    beforeEach(async(() => {
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
      let sc = new ShowCondition('');
      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('field has expected value', () => {
      let sc = new ShowCondition('field1="s1"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('field has expected value and is a number', () => {
      let sc = new ShowCondition('field2="3"');
      let matched = sc.matchByContextFields(contextFields);
      expect(matched).toBe(true);
    });

    it('field starts with a string', () => {
      let sc = new ShowCondition('field3="te*"');
      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return true when multiple values match exactly', () => {
      caseField1.value = ['s1', 's2'];
      let sc = new ShowCondition('field1="s1,s2"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return true when multiple values match exactly regardless of the order', () => {
      caseField1.value = ['s2' , 's1'];
      let sc = new ShowCondition('field1="s1,s2"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return true when complex values match exactly', () => {
      let sc = new ShowCondition('claimantDetails.AddressUKCode.PostTown="London"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });
  });

  describe('not matches when', () => {
    it('field value is not equal to condition', () => {
      let sc = new ShowCondition('field="test"');
      let fields = {
        field : 'test1'
      };
      let matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field value does not start with the condition string', () => {
      let sc = new ShowCondition('field="te*"');
      let fields = {
        field : 'yest'
      };
      let matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field starts with a string and does not exist', () => {
      let sc = new ShowCondition('field="te*"');
      let fields = {
      };
      let matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('should return false when multiple values does not match exactly', () => {
      let sc = new ShowCondition('field="s1,s2"');
      let fields = {
        field : ['s1', 's2' , 's3']
      };

      let matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field mentioned in condition has no value asked in EQUALS condition', () => {
      let sc = new ShowCondition('field="test"');
      let fields = {
        field : undefined
      };
      let matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field mentioned in multi value condition has no value asked in EQUALS condition', () => {
      let sc = new ShowCondition('field="test,pest"');
      let fields = {
        field : undefined
      };
      let matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field mentioned in condition has no value asked in CONTAINS condition', () => {
      let sc = new ShowCondition('fieldCONTAINS"test,mest"');
      let fields = {
        field : []
      };
      let matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field mentioned in condition has no value', () => {
      let sc = new ShowCondition('fieldCONTAINS"test,mest"');
      let fields = {
        field : undefined
      };
      let matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field mentioned in single value condition has no value', () => {
      let sc = new ShowCondition('fieldCONTAINS"test"');
      let fields = {
        field : undefined
      };
      let matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('invalid field mentioned in complex field condition', () => {
      let sc = new ShowCondition('claimantDetails.InvalidField="Mr."');
      let fields = {
        claimantDetails: {
          NamePrefix: 'Mr.'
        }
      };

      let matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('field mentioned in complex field condition has no value', () => {
      let sc = new ShowCondition('claimantDetails.NamePrefix="Mr."');
      let fields = {
        claimantDetails: {
          NamePrefix: undefined
        }
      };

      let matched = sc.match(fields);

      expect(matched).toBe(false);
    });

    it('should return false when value will not match on a collection element with a complex field', () => {
      let sc = new ShowCondition('interimReturns.addressAttended.County="Cornwall"');

      let fields = COLLECTION_OF_INTERIM_RETURNS;
      let path = 'interimReturns_0_outcomeOfVisit'; // path tells the matcher we will match against the element with index 0
      let matched = sc.match(fields, path);

      expect(matched).toBe(false);
    });

    it('should return false when the provided path collection number is invalid', () => {
      let sc = new ShowCondition('interimReturns.addressAttended.County="Cornwall"');

      let fields = COLLECTION_OF_INTERIM_RETURNS;
      let path = 'interimReturns_wrongNumber_outcomeOfVisit'; // we provide invalid element index
      let matched = sc.match(fields, path);

      expect(matched).toBe(false);
    });

    it('should return false when the provided path is broken', () => {
      let sc = new ShowCondition('interimReturns.addressAttended.County="Cornwall"');

      let fields = COLLECTION_OF_INTERIM_RETURNS;
      let path = 'nonMatchingField_0_outcomeOfVisit';
      let matched = sc.match(fields, path);

      expect(matched).toBe(false);
    });

  });

  describe('not matches ByContextFields when', () => {
    beforeEach(async(() => {
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
      let sc = new ShowCondition('field1="test"');
      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });

    it('field value does not start with ' +
      'the condition string', () => {
      let sc = new ShowCondition('field1="te*"');
      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });

    it('should return false when multiple values does not match exactly', () => {
      caseField1.value = ['s2', 's1', 's3'];
      let sc = new ShowCondition('field1="s1,s2"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });

    it('should return false when values does not exist', () => {
      caseField1.value = undefined;
      let sc = new ShowCondition('field1="s1,s2"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });
    it('should return true when complex values match exactly', () => {
      let sc = new ShowCondition('claimantDetails.AddressUKCode="London"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });
  });

  describe('multiple AND conditions', () => {
    beforeEach(async(() => {
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
      let sc = new ShowCondition('field1CONTAINS"s3,s2" AND field2=3 AND field3="te*" AND field4="s1 AND s2"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return false when any condition is false', () => {
      let sc = new ShowCondition('field1="s1" AND field2=3 AND field3="no-match"');
      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });

    it('should evaluate AND conditions correctly when AND keyword is present in the value being matched', () => {
      let sc = new ShowCondition('field4="s1 AND s2" AND field2=3');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should evaluate AND conditions correctly for a mix of EQUALS and CONTAINS', () => {
      caseField2.value = ['s4', 's2', 's3'];
      let sc = new ShowCondition('field4="s1 AND s2" AND field2CONTAINSs3,s4');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return true when all conditions are true when using Complex fields', () => {
      caseField1.value = ['s1', 's2', 's3'];
      let sc = new ShowCondition(
        'field1CONTAINS"s3,s2" AND claimantDetails.AddressUKCode.PostTown="London" AND claimantDetails.AddressUKCode.Country="UK"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });
  });

  describe('CONTAINS expression variations', () => {
    beforeEach(async(() => {
      caseField1.value = ['s1'];
      caseField2.value = 3;
      caseField3.value = 'temmy';
      caseField4.value = 's1 AND s2';
    }));

    it('should return true when single value matches ', () => {
      let sc = new ShowCondition('field1CONTAINS"s1"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return true when values match', () => {
      caseField1.value = ['s1', 's2', 's3'];
      let sc = new ShowCondition('field1CONTAINS"s1,s3"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return true when value match regardless of order', () => {
      caseField1.value = ['s3', 's1', 's2'];
      let sc = new ShowCondition('field1CONTAINS"s2,s1"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return false when values do not match', () => {
      caseField1.value = ['s1', 's2', 's3'];
      let sc = new ShowCondition('field1CONTAINS"s1,s4"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });

    it('should return true when single value condition matches', () => {
      caseField1.value = ['s1', 's2', 's3'];
      let sc = new ShowCondition('field1CONTAINS"s3"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });

    it('should return false for non multi select fields', () => {
      let sc = new ShowCondition('field3CONTAINS"temmy"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });

    it('should return false when value does not exist', () => {
      caseField1.value = undefined;
      let sc = new ShowCondition('field1CONTAINS"s1,s4"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(false);
    });

    it('should return true when single value condition matches when using Complex field', () => {
      complexAddressUK.value = {
        County: ['Middlesex', 'London'],
      };
      let sc = new ShowCondition('claimantDetails.AddressUKCode.CountyCONTAINS"London"');

      let matched = sc.matchByContextFields(contextFields);

      expect(matched).toBe(true);
    });
  });

  describe('addPathPrefixToCondition()', () => {
    it('should add path', () => {
      expect(ShowCondition.addPathPrefixToCondition('field1="test"', '')).toBe('field1="test"');
      expect(ShowCondition.addPathPrefixToCondition('field1="test"', null)).toBe('field1="test"');
      expect(ShowCondition.addPathPrefixToCondition(null, '')).toBe(null);
      expect(ShowCondition.addPathPrefixToCondition(null, null)).toBe(null);
      expect(ShowCondition.addPathPrefixToCondition('', '')).toBe('');

      expect(ShowCondition.addPathPrefixToCondition('field1="test"',
        'ComplexField1.AddressLine1')).toBe('ComplexField1.AddressLine1.field1="test"');
      expect(ShowCondition.addPathPrefixToCondition('field1CONTAINS"s1"',
        'ComplexField1.AddressLine1')).toBe('ComplexField1.AddressLine1.field1CONTAINS"s1"');

      expect(ShowCondition.addPathPrefixToCondition('field1="test" AND field2CONTAINS"s1"',
        'ComplexField1.AddressLine1')).toBe('ComplexField1.AddressLine1.field1="test" AND ComplexField1.AddressLine1.field2CONTAINS"s1"');
    });
  });
  describe('NOT EQUALS', () => {
    it('Scenario1 show: comparator match with specific value', () => {
      let sc = new ShowCondition('field!="MOJ"');
      let fields = {
        field: 'Reform'
      };
      let matched = sc.match(fields);
      expect(matched).toBe(true);
    });
    it('Scenario2 show: is not blank', () => {
      let sc = new ShowCondition('field!=""');
      let fields = {
        field: 'MOJ'
      };
      let matched = sc.match(fields);
      expect(matched).toBe(true);
    });
    it('Scenario2 hide: is not blank', () => {
      let sc = new ShowCondition('field!=""');
      let fields = {
        field: '    '
      };
      let matched = sc.match(fields);
      expect(matched).toBe(false);
    });
    it('Scenario2 hide: is not blank with null value', () => {
      let sc = new ShowCondition('field!=""');
      let fields = {
        field: null
      };
      let matched = sc.match(fields);
      expect(matched).toBe(false);
    });
    it('Scenario3 hide: has any value', () => {
      let sc = new ShowCondition('field!="*"');
      let fields = {
        field: 'MOJ'
      };
      let matched = sc.match(fields);
      expect(matched).toBe(false);
    });
    it('Scenario4 hide: comparator does not match value', () => {
      let sc = new ShowCondition('field!="Reform"');
      let fields = {
        field: 'Reform'
      };
      let matched = sc.match(fields);
      expect(matched).toBe(false);
    });
    it('Scenario4 hide: multi select not equals', () => {
      let sc = new ShowCondition('field!="s1,s2"');
      let fields = {
        field: ['s1', 's2']
      };

      let matched = sc.match(fields);

      expect(matched).toBe(false);
    });
    describe('OR conditional tests', () => {
      it('Scenario1: OR condition', () => {
        let sc = new ShowCondition('field1="field1NoMatchValue" OR field2="field2NoMatchValue" OR field3="field3NoMatchValue"');
        let matched = sc.matchByContextFields(contextFields);
        expect(matched).toBe(false);
      });
      it('Scenario2 positive: OR logic with equals', () => {
        let sc = new ShowCondition('field1="field1Value" OR field2=3 OR field3="no-match"');
        contextFields[1].value = 3;
        let matched = sc.matchByContextFields(contextFields);
        expect(matched).toBe(true);
      });
      it('Scenario2 positive: OR logic with not equals', () => {
        let sc = new ShowCondition('field1!="field1Value" OR field2=3 OR field3="no-match"');
        let matched = sc.matchByContextFields(contextFields);
        expect(matched).toBe(true);
      });
      it('OR condition mixed with AND => equals condition', () => {
        let sc = new ShowCondition('field1="field1NoMatchValue" OR field2="field2NoMatchValue" AND field3="field3NoMatchValue"');
        let matched = sc.matchByContextFields(contextFields);
        expect(matched).toBe(false);
      });
      it('OR condition mixed with AND => not equals condition', () => {
        let sc = new ShowCondition('field1!="field1NoMatchValue" OR field2="field2NoMatchValue" AND field3="field3NoMatchValue"');
        let matched = sc.matchByContextFields(contextFields);
        expect(matched).toBe(true);
      });
      it('AND condition mixed with OR => equals condition', () => {
        let sc = new ShowCondition('field1="field1NoMatchValue" AND field2="field2NoMatchValue" OR field3="field3NoMatchValue"');
        let matched = sc.matchByContextFields(contextFields);
        expect(matched).toBe(false);
      });
      it('AND condition mixed with OR => not equals condition', () => {
        let sc = new ShowCondition('field1!="field1NoMatchValue" AND field2="field2NoMatchValue" OR field3="field3NoMatchValue"');
        let matched = sc.matchByContextFields(contextFields);
        expect(matched).toBe(true);
      });
    });
  });
});
