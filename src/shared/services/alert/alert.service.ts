import { Injectable } from '@angular/core';
import { Observer } from 'rxjs/Observer';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import 'rxjs/operator/publish';
import { ConnectableObservable, Observable } from 'rxjs/Rx';
import { Alert } from '../../domain/alert/alert.model';

enum AlertMessageType {
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error',
  ALERT = 'alert'
}

@Injectable()
export class AlertService {

  private alertObserver: Observer<Alert>;
  private successObserver: Observer<Alert>;
  private errorObserver: Observer<Alert>;
  private warningObserver: Observer<Alert>;

  preservedError = '';
  preservedWarning = '';
  preservedSuccess = '';
  preservedAlert = '';

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
          this.preserveAlerts = false;
        }
      });
  }

  clear(): void {
    this.alertObserver.next(null);
    this.successObserver.next(null);
    this.errorObserver.next(null);
    this.warningObserver.next(null);
    this.preservedError = '';
    this.preservedWarning = '';
    this.preservedSuccess = '';
  }

  error(message: string): void {
    this.preservedError = this.preserveMessages(message);
    this.errorObserver.next({
      level: 'error',
      message: message
    });
  }

  warning(message: string): void {
    this.preservedWarning = this.preserveMessages(message);
    this.warningObserver.next({
      level: 'warning',
      message: message
    });
  }

  success(message: string): void {
    this.preservedSuccess = this.preserveMessages(message);
    this.successObserver.next({
      level: 'success',
      message: message
    });
  }

  setPreserveAlerts(preserve: boolean, urlInfo?: string[]) {
    if (!urlInfo) {
      this.preserveAlerts = preserve;
    } else {
      this.preserveAlerts = this.currentUrlIncludesInfo(preserve, urlInfo);
    }
  }

  currentUrlIncludesInfo(preserve: boolean, urlInfo: string[]): boolean {
    for (const urlSnip of urlInfo) {
      if (!this.router.url.includes(urlSnip)) {
        return !preserve;
      }
    }
    return preserve;
  }

  isPreserveAlerts(): boolean {
    return this.preserveAlerts;
  }

  preserveMessages(message: string) {
    if (this.isPreserveAlerts()) {
      return message;
    } else {
      return '';
    }
  }

  message(message: string): void {
    this.preservedAlert = this.preserveMessages(message);
    this.alertObserver.next({
      level: 'message',
      message: message
    })
  }
}
