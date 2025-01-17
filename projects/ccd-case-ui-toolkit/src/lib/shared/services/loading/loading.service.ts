import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable()
export class LoadingService {
  private readonly registered = new Map<string, string>();
  private readonly loading = new BehaviorSubject<boolean>(false);
  private readonly sharedSpinners = [];

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

  public addSharedSpinner(spinnerId: string){
    this.sharedSpinners.push(spinnerId);
  }

  public hasSharedSpinner(): boolean {
    return this.sharedSpinners.length > 0;
  }

  public unregisterSharedSpinner(): void {
    this.registered.delete(this.sharedSpinners[0]);
    this.sharedSpinners.shift();
    this.loading.next(this.registered.size > 0);
  }

  private generateToken(): string {
    const timestamp = window.performance.now();
    return `toolkit-loading-${timestamp}`; // format: [source-library]-[unique incrementing number]
  }
}
