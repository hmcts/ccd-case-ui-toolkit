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

  let alertService: AlertService;

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
});
