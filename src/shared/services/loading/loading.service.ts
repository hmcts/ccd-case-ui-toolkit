import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable()
export class LoadingService implements HasLoadingState {
  private registered = new Map<string, string>();
  private loading = new BehaviorSubject<boolean>(false);

  public get isLoading(): Observable<boolean> {
    return this.loading.pipe(distinctUntilChanged());
  }

  public register(): string {
    const token = this.generateToken();
    this.registered.set(token, token);
    this.loading.next(true);
    return token;
  }

  public unregister(token: string): void {
    this.registered.delete(token);
    this.loading.next(this.registered.size > 0);
  }

  private generateToken(): string {
    const timestamp = window.performance.now();
    return 'toolkit-loading-' + timestamp; // format: [source-library]-[unique incrementing number]
  }
}

export abstract class HasLoadingState {
  public get isLoading(): Observable<boolean> {
    return;
  };
}
