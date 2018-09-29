import { ShowCondition } from './conditional-show.model';
import { aCaseField } from '../case-editor/case-edit.spec';
import { CaseField } from '../domain/definition/case-field.model';

describe('conditional-show', () => {
  let caseField1: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
  let caseField2: CaseField = aCaseField('field2', 'field2', 'Text', 'OPTIONAL', null);
  let caseField3: CaseField = aCaseField('field3', 'field3', 'Text', 'OPTIONAL', null);
  let caseField4: CaseField = aCaseField('field4', 'field4', 'Text', 'OPTIONAL', null);

  caseField1.value = 's1';
  caseField2.value = 3;
  caseField3.value = 'temmy';
  caseField4.value = 's1 AND s2';

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
  });

  describe('matchByCaseFields when', () => {
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
  });

  describe('not matches ByCaseFields when', () => {
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
  });

  describe('multiple AND conditions', () => {
    it('should return true when all conditions are true', () => {
      let sc = new ShowCondition('field1="s1" AND field2=3 AND field3="te*"');

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
  });
});
