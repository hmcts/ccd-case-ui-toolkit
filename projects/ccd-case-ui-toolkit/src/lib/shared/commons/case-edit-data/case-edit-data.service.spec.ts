import { take } from 'rxjs/operators';
import { CaseEditDataService } from './case-edit-data.service';

describe('CaseEditDataService', () => {
  let service: CaseEditDataService;

  describe('setCaseTitle', () => {
    it('should update title', (done) => {
      service = new CaseEditDataService();
      service.setCaseTitle('mr');
      service.caseTitle$.pipe(take(1)).subscribe((actual) => {
        expect(actual).toEqual('mr');
        done();
      });
    });
  });

  describe('setCaseEventTriggerName', () => {
    it('should update eventTriggerName', (done) => {
      service = new CaseEditDataService();
      service.setCaseEventTriggerName('test');
      service.caseEventTriggerName$.pipe(take(1)).subscribe((actual) => {
        expect(actual).toEqual('test');
        done();
      });
    });
  });

  describe('setFormValidationErrors', () => {
    it('should update formValidationErrors', (done) => {
      const result = [{
        id: 'id',
        message: 'message'
      }]
      service = new CaseEditDataService();
      service.setFormValidationErrors(result);
      service.caseFormValidationErrors$.pipe(take(1)).subscribe((actual) => {
        expect(actual).toEqual(result);
        done();
      });
    });
  });

  describe('addFormValidationError', () => {
    it('should update formValidationErrors', (done) => {
      const result = [{
        id: 'id',
        message: 'message'
      }]
      service = new CaseEditDataService();
      service.addFormValidationError(result[0]);
      service.caseFormValidationErrors$.pipe(take(1)).subscribe((actual) => {
        expect(actual).toEqual(result);
        done();
      });
    });
  });

  describe('setTriggerSubmitEvent', () => {
    it('should update triggerSubmitEvent', (done) => {
      const result = true
      service = new CaseEditDataService();
      service.setTriggerSubmitEvent(result);
      service.caseTriggerSubmitEvent$.pipe(take(1)).subscribe((actual) => {
        expect(actual).toEqual(result);
        done();
      });
    });
  });

  describe('clearFormValidationErrors', () => {
    it('should clear formValidationErrors', (done) => {
      const result = [];
      service = new CaseEditDataService();
      service.clearFormValidationErrors();

      service.caseFormValidationErrors$.pipe(take(1)).subscribe((actual) => {
        expect(actual).toEqual(result);
        done();
      });
    });
  });

});
