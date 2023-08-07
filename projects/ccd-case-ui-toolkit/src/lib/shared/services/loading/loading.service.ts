import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable()
export class LoadingService {
  private readonly registered = new Map<string, string>();
  private readonly loading = new BehaviorSubject<boolean>(false);

  public get isLoading(): Observable<boolean> {
    return this.loading.pipe(distinctUntilChanged());
  }

  public register(): string {
    const token = this.generateToken();
    console.info(`registering [${token}]`);
    this.registered.set(token, token);
    this.loading.next(true);
    console.info(`registered [${token}]`);
    return token;
  }

  public unregister(token: string): void {
    console.info(`unregistering [${token}]`);
    this.registered.delete(token);
    this.loading.next(this.registered.size > 0);
    console.info(`unregistered [${token}]`);
  }

  private generateToken(): string {
    const timestamp = window.performance.now();
    return `toolkit-loading-${timestamp}`; // format: [source-library]-[unique incrementing number]
  }
}
