import { ShowCondition } from './conditional-show.model';
import { async } from '@angular/core/testing';
import { CaseField, createFieldType } from '../../..';
import { newCaseField } from '../../../fixture';

describe('conditional-show', () => {
  let caseField1: CaseField = newCaseField('field1', 'field1', null, null, 'OPTIONAL', null).build();
  let caseField2: CaseField = newCaseField('field2', 'field2', null, null, 'OPTIONAL', null).build();
  let caseField3: CaseField = newCaseField('field3', 'field3', null, null, 'OPTIONAL', null).build();
  let caseField4: CaseField = newCaseField('field4', 'field4', null, null, 'OPTIONAL', null).build();
  let complexAddressUK: CaseField = newCaseField('AddressUKCode', 'Address UK', null,
    createFieldType('AddressUK', 'AddressUK'), 'OPTIONAL', null).build();
  let claimantDetailsField: CaseField = newCaseField('claimantDetails', 'ClaimantsDetails', null,
    createFieldType('Complex', 'Complex',  [complexAddressUK]), 'OPTIONAL', null).build();
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

    it('dynamic list show condition', () => {
      let sc = new ShowCondition('field="List3"');
      let fields = {
        field : { value: {code: 'List3', label: 'List 3'},
        list_items: [{code: 'List1', label: 'List 2'},
          {code: 'List2', label: 'List 3'},
          {code: 'List3', label: 'List 3'}]
      }
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

    it('field starts with a string and has empty value', () => {
      let sc = new ShowCondition('claimantDetails.NamePrefix=""');
      let fields = {
        claimantDetails: {
          NamePrefix: ''
        }
      };

      let matched = sc.match(fields);

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

    it('field starts with a string and does not exist', () => {
      let sc = new ShowCondition('claimantDetails.NamePrefix="Mr."');
      let fields = {
        claimantDetails: {
          OtherPrefix: 'Mr.'
        }
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
    it('Scenario2 hide: is not blank with showCondition multiple spaces', () => {
      let sc = new ShowCondition('field!="  "');
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

const COLLECTION_OF_HEARINGS = {
  'id': 'hearingCollection',
  'value': [{
    'id': 'db4596a8-dd9c-4990-abc7-2bd95a529708',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '2970383c-fc67-4661-808d-3f13dab6add0',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': '4289855b-c01c-421f-be1d-37026dcb88ba',
        'value': {
          'Hearing_clerk': 'Ailsa Dickinson',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '8a7780cc-5413-4279-ac8c-962308e3f6f5',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Jones'
        }
      }, {
        'id': '799ae898-bf4f-4ca0-bb6c-9596d39c6503',
        'value': {
          'Hearing_clerk': 'Andrew Wood',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }]
    }
  }, {
    'id': '0de94717-85fd-4b7f-967f-da090df40cfd',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '59e01825-7570-4c3b-a7f5-265fefe328f3',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '326c52e1-ef7c-405d-ad16-ee967e204ed4',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '85f610be-48bf-4e2c-891b-0a4e5b0cb6bd',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': 'f9fdf9eb-f07e-4bc2-9bc3-877d09eccfd3',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '054ad5a8-4042-4025-b962-8dc416c5ba53',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '7929ec52-c558-4fdc-8c96-441b74d3ba9e',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'e167ea31-08f9-4582-8edf-0cf8e122db78',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'a99125aa-8239-4d9f-af3a-8a7e0de27b51',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': '0bce082d-4d52-45a7-857f-ed393da6e621',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '40a907aa-67b1-4ab8-a117-2473e824e61e',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': 'f9c43538-9930-43b6-8fad-7dc229e6e4ec',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'f8425ed5-319d-47e9-b67c-ef8fcad85bb8',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'a30ab58a-7e65-4ca9-b19f-0bcf6cd40f75',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': '20dc6d84-80f8-4d96-a69b-fd9d0b979023',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '75cb646d-3db1-4aeb-a5a6-14173a7ea0ff',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '6907f963-dfa5-450f-b625-27a6e9f687fa',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'c74d54eb-9b2e-4dab-b3b4-5af7abf3f5ca',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '25e44d1d-ad60-448e-ab17-109b309a1029',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': 'bc07e2db-4f85-433d-b325-734a273dc24d',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': 'f53f65db-5d96-43d9-b8e3-14297e478cec',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': 'bf906237-d7b1-429e-9fe0-eac252056ef6',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '1b2540ae-876e-4049-8245-e8e28543f0e3',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'c151692a-bc46-4189-85bf-fc157018bbfc',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': '4d86ac55-168b-49f4-99b5-ccd542e6987c',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '104cbe87-3b0f-4682-a50a-0e5dc62414bb',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': 'ffe1fc22-f609-4940-9103-4e22d3f9cd05',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'a2ee517a-b8f8-4ec7-8b16-30c3a98c9f03',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'a11884dd-f396-46dd-9b93-912b91057dec',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': '8075fc40-def7-4f23-a4c0-b222113996be',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '9113cacc-6508-4fce-84b1-da2a48079e71',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '2eac1b6c-a0c6-4440-a59b-9548edbc0847',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '08b6d950-97da-4733-a7dc-ed91953e4fba',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '7137b5ab-d36b-4ed7-9c80-35610e1aabb6',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': 'a873ac02-f4a5-410e-92a1-864eaa8d8bf4',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': 'a7e338ef-cfdd-4f59-8001-efe0e0a5e61a',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': 'c33abc8f-4b6d-4490-8b5a-c57e423b66fd',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '0b160998-99a1-4604-91da-037d9645c646',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '0dfd25f5-e4e1-4800-a6f6-2ca002d5b7c3',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': 'f8b73c3a-5bef-4868-8b22-3326140509ab',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '9a905bf7-a6ae-452d-a69f-a88312f89366',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '08a41dbe-6faa-4e79-8ff7-2ab878b9313e',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '8769a6d5-5a6d-4549-a885-b63900f59781',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'd12fe5a3-102a-4454-8508-35fc3664f1fe',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': 'cce3d409-70d4-4ea9-ac1c-3b27c5e8bef4',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': 'bb37012b-22fc-4775-8ded-55fec7ec2288',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '190a56ac-feb2-46f8-a88d-98b381c46e7a',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '3f4cbb45-76e8-48e1-8f26-ce0f2d393278',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '3221fc6e-6de7-4d51-bf44-9fe4028a284f',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': '1e34f745-0096-43b8-ad48-e4c99edd62da',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '490ce5da-b1a6-45c0-a886-b543b64d4869',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '7b8259b3-9566-4191-bd37-ba37387b63d8',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '5d2edd46-9b27-4db0-b0e3-df8ff6ed283a',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'a2e20b38-9abc-4313-9875-9c22616b816e',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': 'daa9bb9b-e99c-4e7e-80bb-10e2f0e51b86',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '68209de6-cfe2-46da-b4a3-eb7a7a6473b9',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': 'f75a5038-78a3-464f-8b1c-6142e82f58ca',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'be7bcff7-cb51-4418-9911-798869d518e2',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '6155ac46-8381-47a3-92c1-e791c763e772',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': 'f88771dd-a638-4835-9dd4-f4e8a080d590',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '5ef83d79-8e6d-4c14-a6ee-f8412f51d36c',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '6db9425a-2879-4724-be4b-f7a25776a6ed',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'f27299e0-600a-4ffe-9a1b-f9f85562ece7',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '9945c383-6387-4255-bbf2-ac094b28fa25',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': 'ee523d61-43f1-43a5-be05-9a9a4ebc9317',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '97522dad-920c-4763-9de4-d87f2b65f0c1',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': 'b1dea1ef-ecfa-4323-aa2d-d9d49d1e70fa',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '2c9e9b26-c77c-4e9e-9457-e1754ebc490d',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '763701e1-daa1-40c9-8f36-6a9afeba4c8a',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': 'f5120561-cb99-40a6-b0de-6a427c60de15',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '8334e83e-04b5-4b62-a3b1-5eed01d11495',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': 'ed3253dc-89f6-4a1b-b3e3-8ed084dba97a',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '3def3d51-fbbd-494e-82bb-6c856d31c982',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '5f931e26-1d13-4121-9500-910943346a07',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': '1522ab3c-31b6-4c9f-919b-ad7ee3802b24',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': 'e0bc60a5-8650-4428-8ebc-72a9341f4c36',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '83d3fc04-1769-4ebc-8911-504d5c199ae0',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '42c2bb00-30f1-455d-b8b7-164445f57744',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'fc77350b-eb22-46ec-b8d4-6a774b6d6af6',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': '36c93945-5a1e-4dd6-9517-d4e1f82306ca',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '4d057ca1-ba81-4b42-935c-a5dff2dc2167',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '7dbabe73-a1ab-4269-9b3f-8cdf37e110cd',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'a766f7c5-e722-4b59-8626-4e7bef7ee4b4',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '71c46c95-dc8e-4439-8a78-56aeafa4a4d3',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': '0c94646f-c3af-4bee-8f83-4eb0eb9b6035',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '23586ea1-e278-4d59-ae21-751de9f24306',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': 'ddf3e514-4445-4f7f-aaa0-b31e6a57f6ad',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'e6d8d16e-4cc2-492f-8f30-57210e7d5fda',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '0bdcc86f-e5ad-4c2b-b815-44a936fe2cc3',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': '505fa6ea-359d-456d-bdbe-15a7cb59d365',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '7746a476-d617-40b0-a6d4-3e456e7f02a2',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '0bc5308b-7366-4955-b94e-6b268fe3c5a7',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '27dfebc1-b899-4ab0-ae8e-67ddfde09964',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '5ca90b45-6a18-4a29-9468-a6902cc88a37',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': '516bac06-56b9-41a5-b3a9-1cfd7133469f',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '3f4cf971-1134-4b71-8a52-fcfaecbc47c9',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '18386d63-d1ac-4b01-b40b-f33704d1229f',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'b5c46ed7-fd1d-454a-9efc-e6fbe1898058',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'e4107f28-8e17-470d-b57c-6460e4a198ae',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': '3b9f2c6a-a999-4457-b2fc-489e972423f4',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '31909141-c611-4651-89ac-17c5d4e7aa54',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '13ffd518-6d6f-4ff8-9236-6a08c03d649a',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '796b30ef-bd24-474d-88e3-d2182741427d',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '8a0a90fb-7b79-4a2d-a53a-bc74a20988ac',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': 'fc7f6a85-7168-49c9-8cee-b75800951cf1',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '19cac75b-530d-4130-bc59-c817af59dc2c',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '8e76cce5-2654-45a9-a8f1-850db734117e',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '77c33e8d-3e64-48ef-bd46-9fc1e4c5cc04',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '921d6c91-4bc8-4949-a4a0-e34d722d70e3',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': '72179bbb-0c06-4e73-a475-e4c9d0eadfad',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': 'ff9d6850-3018-40e9-b88b-989e65a41cdc',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': 'c9f65010-3ed4-4125-a099-38c9601a4e08',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'c1755162-a3e1-4384-922b-25ee8fa6261f',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': 'ab32a319-0f44-4cf2-8740-4a222520415f',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': '8b7b387d-976d-445e-a458-301e16428fee',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }, {
    'id': '3abb1b6e-944a-4665-8554-e30d2c7e5bb7',
    'value': {
      'Hearing_type': 'Hearing',
      'hearingSitAlone': 'Sit Alone',
      'hearingDateCollection': [{
        'id': '4b41ea6a-791b-4288-b46b-61b20a9ee9db',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '0b554f96-3913-4c22-a878-01b1a7c18b96',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'D Franey'
        }
      }, {
        'id': '2e3b958d-255d-40b6-ab8d-5c3c3fba7068',
        'value': {
          'Hearing_clerk': 'Ayesha Hussain',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'CP Rostant'
        }
      }, {
        'id': 'e5254b09-d556-4ce4-ae25-43d80b921d86',
        'value': {
          'Hearing_clerk': 'Ben Williams',
          'Hearing_status': 'Listed',
          'hearingVenueDay': 'Leeds',
          'hearingRoomLeeds': '* Not Allocated',
          'Hearing_judge_name': 'EP Morgan'
        }
      }]
    }
  }]
}

describe ('large nested collection test', () => {
  it('should return true when value will match on a collection element with a complex field', () => {
    let sc = new ShowCondition('hearingVenueDay="Leeds"');

    let fields = COLLECTION_OF_HEARINGS;
    let path = 'hearingsCollection_1_hearingDateCollection_1';
    // let path = 'interimReturns_1_outcomeOfVisit'; // path tells the matcher we will match against the element with index 1
    let matched = sc.match(fields, path);

    expect(matched).toBe(true);
  });

})
