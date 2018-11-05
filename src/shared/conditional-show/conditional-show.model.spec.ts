import { ShowCondition } from './conditional-show.model';
import { CaseField } from '../domain/definition';
import { aCaseField } from '../..';
import { async } from '@angular/core/testing';

describe('conditional-show', () => {
  let caseField1: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
  let caseField2: CaseField = aCaseField('field2', 'field2', 'Text', 'OPTIONAL', null);
  let caseField3: CaseField = aCaseField('field3', 'field3', 'Text', 'OPTIONAL', null);
  let caseField4: CaseField = aCaseField('field4', 'field4', 'Text', 'OPTIONAL', null);

  let caseFields = [caseField1, caseField2, caseField3, caseField4];

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

  });

  describe('matchByCaseFields when', () => {
    beforeEach(async(() => {
      caseField1.value = 's1';
      caseField2.value = 3;
      caseField3.value = 'temmy';
      caseField4.value = 's1 AND s2';
    }));

    it('empty condition', () => {
      let sc = new ShowCondition('');
      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(true);
    });

    it('field has expected value', () => {
      let sc = new ShowCondition('field1="s1"');

      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(true);
    });

    it('field has expected value and is a number', () => {
      let sc = new ShowCondition('field2="3"');
      let matched = sc.matchByCaseFields(caseFields);
      expect(matched).toBe(true);
    });

    it('field starts with a string', () => {
      let sc = new ShowCondition('field3="te*"');
      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(true);
    });

    it('should return true when multiple values match exactly', () => {
      caseField1.value = ['s1', 's2'];
      let sc = new ShowCondition('field1="s1,s2"');

      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(true);
    });

    it('should return true when multiple values match exactly regardless of the order', () => {
      caseField1.value = ['s2' , 's1'];
      let sc = new ShowCondition('field1="s1,s2"');

      let matched = sc.matchByCaseFields(caseFields);

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
  });

  describe('not matches ByCaseFields when', () => {
    beforeEach(async(() => {
      caseField1.value = 's1';
      caseField2.value = 3;
      caseField3.value = 'temmy';
      caseField4.value = 's1 AND s2';
    }));

    it('field value is not equal to condition', () => {
      let sc = new ShowCondition('field1="test"');
      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(false);
    });

    it('field value does not start with ' +
      'the condition string', () => {
      let sc = new ShowCondition('field1="te*"');
      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(false);
    });

    it('should return false when multiple values does not match exactly', () => {
      caseField1.value = ['s2', 's1', 's3'];
      let sc = new ShowCondition('field1="s1,s2"');

      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(false);
    });

    it('should return false when values does not exist', () => {
      caseField1.value = undefined;
      let sc = new ShowCondition('field1="s1,s2"');

      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(false);
    });
  });

  describe('multiple AND conditions', () => {
    beforeEach(async(() => {
      caseField1.value = 's1';
      caseField2.value = 3;
      caseField3.value = 'temmy';
      caseField4.value = 's1 AND s2';
    }));

    it('should return true when all conditions are true', () => {
      caseField1.value = ['s1', 's2', 's3'];
      let sc = new ShowCondition('field1CONTAINS"s3,s2" AND field2=3 AND field3="te*" AND field4="s1 AND s2"');

      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(true);
    });

    it('should return false when any condition is false', () => {
      let sc = new ShowCondition('field1="s1" AND field2=3 AND field3="no-match"');
      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(false);
    });

    it('should evaluate AND conditions correctly when AND keyword is present in the value being matched', () => {
      let sc = new ShowCondition('field4="s1 AND s2" AND field2=3');

      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(true);
    });

    it('should evaluate AND conditions correctly for a mix of EQUALS and CONTAINS', () => {
      caseField2.value = ['s4', 's2', 's3'];
      let sc = new ShowCondition('field4="s1 AND s2" AND field2CONTAINSs3,s4');

      let matched = sc.matchByCaseFields(caseFields);

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

      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(true);
    });

    it('should return true when values match', () => {
      caseField1.value = ['s1', 's2', 's3'];
      let sc = new ShowCondition('field1CONTAINS"s1,s3"');

      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(true);
    });

    it('should return true when value match regardless of order', () => {
      caseField1.value = ['s3', 's1', 's2'];
      let sc = new ShowCondition('field1CONTAINS"s2,s1"');

      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(true);
    });

    it('should return false when value does not match', () => {
      caseField1.value = ['s1', 's2', 's3'];
      let sc = new ShowCondition('field1CONTAINS"s1,s4"');

      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(false);
    });

    it('should return false when value does not exist', () => {
      caseField1.value = undefined;
      let sc = new ShowCondition('field1CONTAINS"s1,s4"');

      let matched = sc.matchByCaseFields(caseFields);

      expect(matched).toBe(false);
    });
  });
});
