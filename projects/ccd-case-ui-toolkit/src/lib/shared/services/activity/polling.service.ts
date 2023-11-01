import { Injectable } from '@angular/core';
import { Observable, fromEvent, empty, timer, interval, concat } from 'rxjs';
import { switchMap, startWith, retryWhen, scan, tap, take, repeat } from 'rxjs/operators';
import { IOptionsApp } from '../../domain/polling';

// Code adapted from rx-polling - https://github.com/jiayihu/rx-polling to work with angular 15 and node upgrade - angular 15 and node 18.17.0
@Injectable()
export class PollingService {
  private defaultOptions = {
    attempts: 9,
    backoffStrategy: 'exponential',
    exponentialUnit: 1000,
    randomRange: [1000, 10000],
    backgroundPolling: false
  };

  polling<T>(request$: Observable<T>, userOptions: IOptionsApp): Observable<T> {
    const options = { ...this.defaultOptions, ...userOptions };

    let allErrorsCount = 0;
    let lastRecoverCount = 0;

    return fromEvent(document, 'visibilitychange').pipe(
      startWith(null),
      switchMap(() => {
        if (this.isPageActive() || options.backgroundPolling) {
          const firstRequest$ = request$;
          const polling$ = interval(options.interval).pipe(
            take(1),
            switchMap(() => request$),
            repeat()
          );

          return concat(firstRequest$, polling$).pipe(
            retryWhen((errors$) => {
              return errors$.pipe(
                scan(
                  ({ errorCount, error }, err) => ({ errorCount: errorCount + 1, error: err }),
                  { errorCount: 0, error: null }
                ),
                switchMap(({ errorCount, error }) => {
                  allErrorsCount = errorCount;
                  const consecutiveErrorsCount = allErrorsCount - lastRecoverCount;

                  if (consecutiveErrorsCount > options.attempts) {
                    throw error;
                  }

                  const delay = this.getStrategyDelay(consecutiveErrorsCount, options);
                  return timer(delay);
                })
              );
            })
          );
        }

        return empty();
      }),
      tap<T>(() => {
        // Update the counter after every successful polling
        lastRecoverCount = allErrorsCount;
      })
    );
  }

  private isPageActive(): boolean {
    return !Boolean(document.hidden);
  }

  private getStrategyDelay(consecutiveErrorsCount: number, options: IOptionsApp): number {
    switch (options.backoffStrategy) {
      case 'exponential':
        return Math.pow(2, consecutiveErrorsCount - 1) * options.exponentialUnit;
      case 'random':
        const [min, max] = Array.isArray(options.randomRange) ? options.randomRange : [0, 0];
        return this.cryptoSecureRandom(min, max);
      case 'consecutive':
        return options.constantTime || options.interval;
      default:
        console.error(`${options.backoffStrategy} is not a backoff strategy supported by rx-polling`);
        return options.constantTime || options.interval;
    }
  }

  private cryptoSecureRandom(min: number, max: number): number {
    const range = max - min + 1;
    const byteArray = new Uint32Array(1);

    crypto.getRandomValues(byteArray);

    return min + (byteArray[0] % range);
  }
}
