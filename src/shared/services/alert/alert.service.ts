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

  // the preserved messages
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

  preserveMessages(message: string) {
    // preserve the messages if set to preserve them
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
