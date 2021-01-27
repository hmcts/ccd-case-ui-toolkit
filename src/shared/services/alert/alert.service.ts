import { Injectable } from '@angular/core';
import { Observer } from 'rxjs/Observer';
import { NavigationStart, Router } from '@angular/router';
import 'rxjs/operator/publish';
import { ConnectableObservable, Observable } from 'rxjs/Rx';
import { Alert } from '../../domain/alert/alert.model';

@Injectable()
export class AlertService {

  private alertObserver: Observer<Alert>;
  private successObserver: Observer<Alert>;
  private errorObserver: Observer<Alert>;
  private warningObserver: Observer<Alert>;

  alerts: ConnectableObservable<Alert>;
  successes: ConnectableObservable<Alert>;
  errors: ConnectableObservable<Alert>;
  warnings: ConnectableObservable<Alert>;
  private preserveAlerts = false;

  constructor(private router: Router) {
    this.alerts = Observable
      .create(observer => this.alertObserver = observer)
      .publish();
    this.alerts.connect();

    this.successes = Observable
      .create(observer => this.successObserver = observer)
      .publish();
    this.successes.connect();

    this.errors = Observable
      .create(observer => this.errorObserver = observer)
      .publish();
    this.errors.connect();

    this.warnings = Observable
      .create(observer => this.warningObserver = observer)
      .publish();
    this.warnings.connect();

    this.router
      .events
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          if (!this.preserveAlerts) {
            this.clear();
          }
          this.setPreserveAlerts(false);
        }
      });
  }

/*   push(alert: Alert): void {
    this.observer.next([alert, {
      level: 'warning',
      message: 'ababababab'
    }]);
  } */

  clear(): void {
    this.alertObserver.next(null);
    this.successObserver.next(null);
    this.errorObserver.next(null);
    this.warningObserver.next(null);
  }

  error(message: string): void {
    this.errorObserver.next({
      level: 'error',
      message: message
    });
  }

  warning(message: string): void {
    this.warningObserver.next({
      level: 'warning',
      message: message
    });
  }

  success(message: string): void {
    this.successObserver.next({
      level: 'success',
      message: message
    });
  }

  setPreserveAlerts(preserve: boolean) {
    this.preserveAlerts = preserve;
  }

  isPreserveAlerts(): boolean {
    return this.preserveAlerts;
  }

  message(message: string): void {
    this.alertObserver.next({
      level: 'message',
      message: message
    })
  }
}
