import { AlertService } from './alert.service';
import { Alert } from '../../domain/alert/alert.model';
import { NavigationEnd, NavigationStart } from '@angular/router';

describe('AlertService', () => {

  const ALERT: Alert = {
    level: 'error',
    message: 'This is an error'
  };
  const OTHER_ALERT: Alert = {
    level: 'success',
    message: 'This is a success'
  };
  const MESSAGE_ALERT: Alert = {
    level: 'message',
    message: 'This is a success with a warning'
  };

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

  it('should publish alert to observable when push method used', done => {
    alertService
      .alerts
      .subscribe(alert => {
        expect(alert).toEqual(ALERT);
        done();
      });

    alertService.push(ALERT);
  });

  it('should publish null to observable when clear method used', done => {
    alertService
      .alerts
      .subscribe(alert => {
        expect(alert).toBeFalsy();
        done();
      });

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
    alertService.push(OTHER_ALERT);

    alertService
      .alerts
      .subscribe(alert => {
        expect(alert).toEqual(ALERT);
        done();
      });

    alertService.push(ALERT);
  });

  it('should call `push` with error alert when using `error` method', () => {
    spyOn(alertService, 'push');

    alertService.error(ALERT.message);

    expect(alertService.push).toHaveBeenCalledWith(ALERT);
  });

  it('should call `push` with success alert when using `success` method', () => {
    spyOn(alertService, 'push');

    alertService.success(OTHER_ALERT.message);

    expect(alertService.push).toHaveBeenCalledWith(OTHER_ALERT);
  });

  it('should call `push` with warning alert when using `warn` method', () => {
    spyOn(alertService, 'push');

    alertService.message(MESSAGE_ALERT.message);

    expect(alertService.push).toHaveBeenCalledWith(MESSAGE_ALERT);
  });
});
