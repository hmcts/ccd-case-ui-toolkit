import { HttpParams } from '@angular/common/http';
import { OptionsType } from '../http';
import { RequestOptionsBuilder } from './request.options.builder';

describe('RequestOptionsBuilder', () => {

  let params: HttpParams;
  let requestOptionsBuilder: RequestOptionsBuilder;

  describe('buildOptions()', () => {

    beforeEach(() => {
      function matchCall(value: any, expected: any): boolean {
        return expected === value ||
            JSON.stringify(expected) === JSON.stringify(value) ||
            expected[0] === value[0] && JSON.stringify(expected[1]).trim() === JSON.stringify(value[1]).trim();
      }

      jasmine.addCustomEqualityTester(matchCall);
      params = new HttpParams();
      requestOptionsBuilder = new RequestOptionsBuilder();
    });

    it('should not set if no params', () => {
      const result = requestOptionsBuilder.buildOptions({}, {});

      const expected: OptionsType = { params, observe: 'body'};
      expect(result).toEqual(expected);
    });

    it('should set view if present', () => {
      const result = requestOptionsBuilder.buildOptions({}, {}, 'WORKBASKET');

      params = params.set('view', 'WORKBASKET');
      const expected: OptionsType = { params, observe: 'body'};
      expect(result).toEqual(expected);
    });

    it('should set metaCriteria if present', () => {
      const metaCriteria = {caseState: 'testState'};
      const result = requestOptionsBuilder.buildOptions(metaCriteria, {});

      params = params.set('caseState', 'testState');
      const expected: OptionsType = {params, observe: 'body'};
      expect(result).toEqual(expected);
    });

    // FIXME
    xit('should set caseCriteria if present', () => {
      const caseCriteria = {firstName: 'testFirstName', lastName: 'testLastName'};
      const result = requestOptionsBuilder.buildOptions({}, caseCriteria);

      params = params.set('case.firstName', 'testFirstName');
      params = params.set('case.lastName', 'testLastName');
      const expected: OptionsType = {params, observe: 'body'};
      expect(result).toEqual(expected);
    });

    // FIXME
    xit('should set all params if present', () => {
      const metaCriteria = {caseState: 'testState'};
      const caseCriteria = {firstName: 'testFirstName', lastName: 'testLastName'};
      const result = requestOptionsBuilder.buildOptions(metaCriteria, caseCriteria, 'WORKBASKET');

      params = params.set('view', 'WORKBASKET');
      params = params.set('caseState', 'testState');
      params = params.set('case.firstName', 'testFirstName');
      params = params.set('case.lastName', 'testLastName');
      const expected: OptionsType = {params, observe: 'body'};
      expect(result).toEqual(expected);
    });
  });
});
