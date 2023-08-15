import { Injectable } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { delayWhen, finalize, mergeMap, retryWhen, tap, timeout } from 'rxjs/operators';

@Injectable()
export class RetryUtil {

    private artificialDelayOn = true;
    private artificialDelayPeriod = Math.random() > 0.5 ? 60 : 3;

    public switchArtificialDelays(status: boolean) {
        this.artificialDelayOn = status;
        this.artificialDelayPeriod = Math.random() > 0.5 ? 60 : 2;
    }

    public switchOnArtificialDelays() {
        this.switchArtificialDelays(true);
    }

    public switchOffArtificialDelays() {
        this.switchArtificialDelays(false);
    }

    public getArtificialDelayTime() {
        return this.artificialDelayOn ? this.artificialDelayPeriod : 0;
    }

    public pipeTimeoutMechanismOn<T>(in$: Observable<T>, environment: string, timeoutPeriods: number[]): Observable<T> {
        this.switchOnArtificialDelays();
        let out$ = in$;
        if (environment === 'aat') {
            out$ = this.pipeArtificialDelayOn(out$);
        }
        out$ = this.pipeTimeOutControlOn(out$, timeoutPeriods);
        out$ = this.pipeRetryMechanismOn(out$);
        return out$;
    }

    private pipeTimeOutControlOn<T>(in$: Observable<T>, timeoutPeriods: number[]): Observable<T> {
        const timeOutAfterSeconds = timeoutPeriods[0];
        const out$ = in$.pipe(timeout(timeOutAfterSeconds * 1000));
        return out$;
    }

    private pipeRetryMechanismOn<T>(in$: Observable<T>): Observable<T> {
        const retryStrategy = (errors) => {
            return errors.pipe(
                mergeMap((error: Error, i) => {
                    console.error(`Mapping error ${error?.name}, ${i}`);
                    console.error(error);
                    if (error?.name === 'TimeoutError' && i === 0) {
                        this.switchOffArtificialDelays();
                        console.info('Will retry, after a timeout error.');
                    }
                    else {
                        console.error('Will NOT retry.');
                        throwError(error);
                    }
                    return timer(0);
                }),
                finalize(() => console.log('We are done!')));
        };
        const out$ = in$.pipe(retryWhen(retryStrategy));
        return out$;
    }

    private pipeArtificialDelayOn<T>(in$: Observable<T>): Observable<T> {
        let out$ = in$.pipe(tap(() => {
            console.log(`Artificially delaying for ${this.getArtificialDelayTime()} seconds..`);
        }));
        out$ = out$.pipe(delayWhen(() => timer(this.getArtificialDelayTime() * 1000)));
        out$ = out$.pipe(tap(() => {
            console.log(`Artificially delayed for ${this.getArtificialDelayTime()} seconds..`);
        }));
        return out$;
    }


}
