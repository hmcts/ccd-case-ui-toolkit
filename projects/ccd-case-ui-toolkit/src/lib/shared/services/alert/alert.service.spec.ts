import { NavigationEnd, NavigationStart } from '@angular/router';
import { of } from 'rxjs';
import { Alert } from '../../domain/alert/alert.model';
import { AlertService } from './alert.service';

describe('AlertService', () => {

  const ERROR_ALERT: Alert = {
    level: 'error',
    message: 'This is an error'
  };
  const SUCCESS_ALERT: Alert = {
    level: 'success',
    message: 'This is a success'
  };
  const WARNING_ALERT: Alert = {
    level: 'warning',
    message: 'This is a warning'
  };
  const MESSAGE_ALERT: Alert = {
    level: 'message',
    message: 'This is a success with a warning'
  };

  const ERROR_MESSAGE = 'This is an error';
  const SUCCESS_MESSAGE = 'This is a success';
  const WARNING_MESSAGE = 'This is a warning';
  const A_MESSAGE = 'This is a success with a warning';

  let routerObserver;
  let router;
  let firstMockUrlRouter;
  let secondMockUrlRouter;

  let alertService: AlertService;
  let firstMockUrlAlertService: AlertService;
  let secondMockUrlAlertService: AlertService;

  const rpxTranslationServiceSpy = jasmine.createSpyObj('RpxTranslationService', ['getTranslation', 'getTranslationWithReplacements']);

  beforeEach(() => {
    router = {
      events: {
        subscribe: observer => routerObserver = observer
      }
    };

    alertService = new AlertService(router, rpxTranslationServiceSpy);
  });

  it('should offer observable alert stream', () => {
    expect(alertService.errors.subscribe).toBeTruthy();
    expect(alertService.warnings.subscribe).toBeTruthy();
    expect(alertService.successes.subscribe).toBeTruthy();
  });

  it('should publish alert to observable when errors method used', done => {
    rpxTranslationServiceSpy.getTranslation.and.returnValue(of(ERROR_MESSAGE));

    alertService
      .errors
      .subscribe(alert => {
        expect(alert).toEqual(ERROR_ALERT);
        done();
      });

    alertService.error(ERROR_MESSAGE);
  });

  it('should publish alert to observable when successes method used', done => {
    rpxTranslationServiceSpy.getTranslation.and.returnValue(of(SUCCESS_MESSAGE));

    alertService
      .successes
      .subscribe(alert => {
        expect(alert).toEqual(SUCCESS_ALERT);
        done();
      });

    alertService.success(SUCCESS_MESSAGE);
  });

  it('should publish alert to observable when warnings method used', done => {
    rpxTranslationServiceSpy.getTranslation.and.returnValue(of(WARNING_MESSAGE));

    alertService
      .warnings
      .subscribe(alert => {
        expect(alert).toEqual(WARNING_ALERT);
        done();
      });

    alertService.warning(WARNING_MESSAGE);
  });

  it('should publish null to errors observable when clear method used', done => {
    // set up all observables with expected null values
    alertService
      .errors
      .subscribe(alert => {
        expect(alert).toBeFalsy();
        done();
      });

    // all observables cleared via this method
    alertService.clear();
  });

  it('should publish null to successes observable when clear method used', done => {
    alertService
      .successes
      .subscribe(alert => {
        expect(alert).toBeFalsy();
        done();
      });

    // all observables cleared via this method
    alertService.clear();
  });

  it('should publish null to warnings observable when clear method used', done => {
    alertService
      .warnings
      .subscribe(alert => {
        expect(alert).toBeFalsy();
        done();
      });

    // all observables cleared via this method
    alertService.clear();
  });

  it('should clear alerts when route navigation starts if no preserve alerts', () => {
    spyOn(alertService, 'clear');
    alertService.setPreserveAlerts(false);
    routerObserver(new NavigationStart(0, ''));

    expect(alertService.clear).toHaveBeenCalled();
  });

  it('should not clear alerts when route navigation starts if preserve alerts', () => {
    spyOn(alertService, 'clear');
    alertService.setPreserveAlerts(true);
    routerObserver(new NavigationStart(0, ''));

    expect(alertService.clear).not.toHaveBeenCalled();
  });

  it('should reset preserve alerts after navigation has completed', () => {

    alertService.setPreserveAlerts(true);
    routerObserver(new NavigationStart(0, ''));

    const preserve = alertService.isPreserveAlerts();
    expect(preserve).toBe(false);
  });

  it('should not clear alerts when route navigation ends', () => {
    spyOn(alertService, 'clear');

    routerObserver(new NavigationEnd(0, '', ''));

    expect(alertService.clear).not.toHaveBeenCalled();
  });


  describe('error', () => {
    it('should be a hot alert errors observable', done => {
      rpxTranslationServiceSpy.getTranslation.and.returnValue(of(ERROR_MESSAGE));
      // set an original message
      alertService.error(WARNING_MESSAGE);

      alertService
        .errors
        .subscribe(alert => {
          expect(alert).toEqual(ERROR_ALERT);
          done();
        });

      // set the new message
      alertService.error(ERROR_MESSAGE);
    });

    it('should be a hot alert errors observable with replacements params', done => {
      rpxTranslationServiceSpy.getTranslationWithReplacements.and.returnValue(of(WARNING_MESSAGE));
      // set an original message
      alertService.error(WARNING_MESSAGE);

      alertService
        .errors
        .subscribe(alert => {
          expect(alert).toEqual(ERROR_ALERT);
          done();
        });

      // set the new message
      alertService.error(ERROR_MESSAGE);
    });
  });

  describe('warning', () => {
    it('should be a hot alert warnings observable', done => {
      rpxTranslationServiceSpy.getTranslation.and.returnValue(of(WARNING_MESSAGE));
      // set an original message
      alertService.warning(A_MESSAGE);

      alertService
        .warnings
        .subscribe(alert => {
          expect(alert).toEqual(WARNING_ALERT);
          done();
        });

      // set the new message
      alertService.warning(WARNING_MESSAGE);
    });

    it('should be a hot alert warnings observable with replacements params', done => {
      rpxTranslationServiceSpy.getTranslationWithReplacements.and.returnValue(of(A_MESSAGE));
      // set an original message
      alertService.warning(WARNING_MESSAGE);

      alertService
        .warnings
        .subscribe(alert => {
          expect(alert).toEqual(WARNING_ALERT);
          done();
        });

      // set the new message
      alertService.warning(WARNING_MESSAGE);
    });
  });

  describe('success', () => {
    it('should be a hot alert successs observable', done => {
      rpxTranslationServiceSpy.getTranslation.and.returnValue(of(SUCCESS_MESSAGE));
      // set an original message
      alertService.success(A_MESSAGE);

      alertService
        .successes
        .subscribe(alert => {
          expect(alert).toEqual(SUCCESS_ALERT);
          done();
        });

      // set the new message
      alertService.success(SUCCESS_MESSAGE);
    });

    it('should be a hot alert successs observable with replacements params', done => {
      rpxTranslationServiceSpy.getTranslationWithReplacements.and.returnValue(of(SUCCESS_MESSAGE));
      // set an original message
      alertService.success(WARNING_MESSAGE);

      alertService
        .successes
        .subscribe(alert => {
          expect(alert).toEqual(SUCCESS_ALERT);
          done();
        });

      // set the new message
      alertService.success(SUCCESS_MESSAGE);
    });
  });

  it('should set the messages to be preserved and kept', () => {
    alertService.setPreserveAlerts(true);
    expect(alertService.preserveMessages(A_MESSAGE)).toBe(A_MESSAGE);

    alertService.setPreserveAlerts(false);
    expect(alertService.preserveMessages(A_MESSAGE)).toBe('');
  });

  describe('check url functionality', () => {
    firstMockUrlRouter = {
      events: {
        subscribe: observer => routerObserver = observer
      },
      url: 'cases/case-1/'
    };
    secondMockUrlRouter = {
      events: {
        subscribe: observer => routerObserver = observer
      },
      url: 'cases/case-2/'
    };
    firstMockUrlAlertService = new AlertService(firstMockUrlRouter, rpxTranslationServiceSpy);
    secondMockUrlAlertService = new AlertService(secondMockUrlRouter, rpxTranslationServiceSpy);
    it('should enable checking if the current url contains the string', () => {
      // first check the first alert service
      expect(firstMockUrlAlertService.currentUrlIncludesInfo(true, ['example'])).toBe(false);
      expect(firstMockUrlAlertService.currentUrlIncludesInfo(true, ['case-1'])).toBe(true);
      expect(firstMockUrlAlertService.currentUrlIncludesInfo(true, ['case-2'])).toBe(false);
      expect(firstMockUrlAlertService.currentUrlIncludesInfo(false, ['case-1'])).toBe(false);

      // second check the second alert service
      expect(secondMockUrlAlertService.currentUrlIncludesInfo(true, ['example'])).toBe(false);
      expect(secondMockUrlAlertService.currentUrlIncludesInfo(true, ['case-1'])).toBe(false);
      expect(secondMockUrlAlertService.currentUrlIncludesInfo(true, ['case-2'])).toBe(true);
      expect(secondMockUrlAlertService.currentUrlIncludesInfo(false, ['case-1'])).toBe(true);

      // now check for more than one in list
      expect(firstMockUrlAlertService.currentUrlIncludesInfo(true, ['case-1', 'cases'])).toBe(true);
      expect(firstMockUrlAlertService.currentUrlIncludesInfo(true, ['case-1', 'not-cases'])).toBe(false);
    });

    it('should set the preserveAlerts value correctly', () => {
      alertService.setPreserveAlerts(true);
      expect(alertService.isPreserveAlerts()).toBe(true);
      alertService.setPreserveAlerts(false);
      expect(alertService.isPreserveAlerts()).toBe(false);

      firstMockUrlAlertService.setPreserveAlerts(true, ['case-1']);
      expect(firstMockUrlAlertService.isPreserveAlerts()).toBe(true);
      firstMockUrlAlertService.setPreserveAlerts(true, ['case-1', 'not-cases']);
      expect(firstMockUrlAlertService.isPreserveAlerts()).toBe(false);
    });
  });
});
