import { Injectable } from '@angular/core';
import { Observer } from 'rxjs/Observer';
import { NavigationStart, Router } from '@angular/router';
import 'rxjs/operator/publish';
import { ConnectableObservable, Observable } from 'rxjs/Rx';
import { Alert } from '../../domain/alert/alert.model';
import { AlertLevel } from '../../domain';

@Injectable()
export class AlertService {

  private successObserver: Observer<Alert>;
  private errorObserver: Observer<Alert>;
  private warningObserver: Observer<Alert>;
  // TODO: Remove
  private alertObserver: Observer<Alert>;

  // the preserved messages
  preservedError = '';
  preservedWarning = '';
  preservedSuccess = '';

  // TODO: Remove
  message: string;
  level: AlertLevel;

  successes: ConnectableObservable<Alert>;
  errors: ConnectableObservable<Alert>;
  warnings: ConnectableObservable<Alert>;
  // TODO: Remove
  alerts: ConnectableObservable<Alert>;

  private preserveAlerts = false;

  constructor(private router: Router) {

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

    // TODO: Remove
    this.alerts = Observable
      .create(observer => this.alertObserver = observer)
      .publish();
    this.alerts.connect();

    this.router
      .events
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          // if there is no longer a preserve alerts setting for the page then clear all observers and preserved messages
          if (!this.preserveAlerts) {
            this.clear();
          }
          // if not, then set the preserving of alerts to false so rendering to a new page
          this.preserveAlerts = false;
        }
      });
  }

  clear(): void {
    this.successObserver.next(null);
    this.errorObserver.next(null);
    this.warningObserver.next(null);
    this.preservedError = '';
    this.preservedWarning = '';
    this.preservedSuccess = '';

    // EUI-3381.
    this.alertObserver.next(null);
    this.message = '';
  }

  error(message: string): void {
    this.preservedError = this.preserveMessages(message);
    const alert: Alert = { level: 'error', message };
    this.errorObserver.next(alert);

    // EUI-3381.
    this.push(alert);
  }

  warning(message: string): void {
    this.preservedWarning = this.preserveMessages(message);
    const alert: Alert = { level: 'warning', message };
    this.warningObserver.next(alert);

    // EUI-3381.
    this.push(alert);
  }

  success(message: string, preserve = false): void {
    this.preservedSuccess = this.preserveMessages(message);
    this.preserveAlerts = preserve || this.preserveAlerts;
    const alert: Alert = { level: 'success', message };
    this.successObserver.next(alert);

    // EUI-3381.
    this.push(alert);
  }

  setPreserveAlerts(preserve: boolean, urlInfo?: string[]) {
    // if there is no url setting then just preserve the messages
    if (!urlInfo) {
      this.preserveAlerts = preserve;
    } else {
      // check if the url includes the sting given
      this.preserveAlerts = this.currentUrlIncludesInfo(preserve, urlInfo);
    }
  }

  currentUrlIncludesInfo(preserve: boolean, urlInfo: string[]): boolean {
    // loop through the list of strings and check the router includes all of them
    for (const urlSnip of urlInfo) {
      if (!this.router.url.includes(urlSnip)) {
        // return the opposite boolean value if the router does not include one of the strings
        return !preserve;
      }
    }
    // return the boolean value if all strings are in the url
    return preserve;
  }

  isPreserveAlerts(): boolean {
    return this.preserveAlerts;
  }

  preserveMessages(message: string): string {
    // preserve the messages if set to preserve them
    if (this.isPreserveAlerts()) {
      return message;
    } else {
      return '';
    }
  }

  // TODO: Remove
  push(msgObject) {
    this.message = msgObject.message;
    this.level = msgObject.level;

    this.alertObserver.next({
      level: this.level,
      message: this.message
    });
  }
}
