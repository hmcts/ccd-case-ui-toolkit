import { Injectable } from '@angular/core';
import { Observer } from 'rxjs/Observer';
import { NavigationStart, Router } from '@angular/router';
import 'rxjs/operator/publish';
import { ConnectableObservable, Observable } from 'rxjs/Rx';
import { Alert } from '../../domain/alert/alert.model';

@Injectable()
export class AlertService {

  private observer: Observer<Alert>;

  alerts: ConnectableObservable<Alert>;
  private preserveAlerts = false;

  constructor(private router: Router) {
    this.alerts = Observable
      .create(observer => this.observer = observer)
      .publish();
    this.alerts.connect();

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

  push(alert: Alert): void {
    this.observer.next(alert);
  }

  clear(): void {
    this.observer.next(null);
  }

  error(message: string): void {
    this.push({
      level: 'error',
      message: message
    });
  }

  warning(message: string): void {
    this.push({
      level: 'warning',
      message: message
    });
  }

  success(message: string): void {
    this.push({
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
    this.push({
      level: 'message',
      message: message
    });
  }
}
