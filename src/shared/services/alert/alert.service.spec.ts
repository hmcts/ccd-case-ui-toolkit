import { AlertService } from './alert.service';
import { Alert } from '../../domain/alert/alert.model';
import { NavigationEnd, NavigationStart } from '@angular/router';

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

  const ERROR_MESSAGE = 'This is an error'
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

  beforeEach(() => {
    router = {
      events: {
        subscribe: observer => routerObserver = observer
      }
    };

    alertService = new AlertService(router);
  });

  it('should offer observable alert stream', () => {
    expect(alertService.alerts.subscribe).toBeTruthy();
  });

  it('should publish alert to observable when respective methods used', done => {
    // set up all observables with expected results
    alertService
      .alerts
      .subscribe(alert => {
        expect(alert).toEqual(MESSAGE_ALERT);
        done();
      });

    alertService
      .errors
      .subscribe(alert => {
        expect(alert).toEqual(ERROR_ALERT);
        done();
      });

    alertService
      .successes
      .subscribe(alert => {
        expect(alert).toEqual(SUCCESS_ALERT);
        done();
      });

    alertService
      .warnings
      .subscribe(alert => {
        expect(alert).toEqual(WARNING_ALERT);
        done();
      });

    // set the respective methods
    alertService.message(A_MESSAGE);
    alertService.error(ERROR_MESSAGE);
    alertService.success(SUCCESS_MESSAGE);
    alertService.warning(WARNING_MESSAGE);
  });

  it('should publish null to observable when clear method used', done => {
    // set up all observables with expected null values
    alertService
      .alerts
      .subscribe(alert => {
        expect(alert).toBeFalsy();
        done();
      });

    alertService
      .errors
      .subscribe(alert => {
        expect(alert).toBeFalsy();
        done();
      });

    alertService
      .successes
      .subscribe(alert => {
        expect(alert).toBeFalsy();
        done();
      });

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

    let preserve = alertService.isPreserveAlerts();
    expect(preserve).toBe(false);
  });

  it('should not clear alerts when route navigation ends', () => {
    spyOn(alertService, 'clear');

    routerObserver(new NavigationEnd(0, '', ''));

    expect(alertService.clear).not.toHaveBeenCalled();
  });

  it('should be a hot alert observable', done => {
    // set an original message
    alertService.message(WARNING_MESSAGE);
    alertService.error(WARNING_MESSAGE);
    alertService.success(WARNING_MESSAGE);
    alertService.warning(A_MESSAGE);

    // change the messages on each observable
    alertService
      .alerts
      .subscribe(alert => {
        expect(alert).toEqual(MESSAGE_ALERT);
        done();
      });

    alertService
      .errors
      .subscribe(alert => {
        expect(alert).toEqual(ERROR_ALERT);
        done();
      });

    alertService
      .successes
      .subscribe(alert => {
        expect(alert).toEqual(SUCCESS_ALERT);
        done();
      });

    alertService
      .warnings
      .subscribe(alert => {
        expect(alert).toEqual(WARNING_ALERT);
        done();
      });

    // set the new message
    alertService.message(A_MESSAGE);
    alertService.error(ERROR_MESSAGE);
    alertService.success(SUCCESS_MESSAGE);
    alertService.warning(WARNING_MESSAGE);
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
    }
    secondMockUrlRouter = {
      events: {
        subscribe: observer => routerObserver = observer
      },
      url: 'cases/case-2/'
    }
    firstMockUrlAlertService = new AlertService(firstMockUrlRouter);
    secondMockUrlAlertService = new AlertService(secondMockUrlRouter);
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
