import { Injectable } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { delayWhen, finalize, mergeMap, retryWhen, tap, timeout } from 'rxjs/operators';

class ArtificialDelayContext {
    private artificialDelayOn = true;
    private selectedDelay = this.selectActualDelayTime();;
    constructor(
        private preferredDelay: number
    ) {
    }
    public switchArtificialDelays(status: boolean) {
        this.artificialDelayOn = status;
        this.selectedDelay = this.selectActualDelayTime();
    }
    public turnOnArtificialDelays() {
        this.switchArtificialDelays(true);
    }

    public turnOffArtificialDelays() {
        this.switchArtificialDelays(false);
    }
    public getActualDelay() {
        return this.artificialDelayOn ? this.selectedDelay : 0;
    }

    public shouldApplyArtificialDelay() {
        return this.preferredDelay > 0;
    }

    private selectActualDelayTime() {
        return Date.now() % 2 == 0 ? this.preferredDelay : 1;
    }
}

@Injectable()
export class RetryUtil {
    public pipeTimeoutMechanismOn<T>(in$: Observable<T>, preferredArtificialDelay: number, timeoutPeriods: number[]): Observable<T> {
        const artificialDelayContext = new ArtificialDelayContext(preferredArtificialDelay);
        console.info(`Piping a retry mechanism with timeouts {${timeoutPeriods}}.`);
        console.info(`Artificial delay will be applied: ${artificialDelayContext.shouldApplyArtificialDelay()}.`);

        let out$ = in$;
        if (artificialDelayContext.shouldApplyArtificialDelay()) {
            console.info(`Preferred artificial delay: ${preferredArtificialDelay} seconds. Actual delay selected: ${artificialDelayContext.getActualDelay()}`);
            out$ = this.pipeArtificialDelayOn(out$, artificialDelayContext);
        }
        out$ = this.pipeTimeOutControlOn(out$, timeoutPeriods);
        out$ = this.pipeRetryMechanismOn(out$, artificialDelayContext);
        return out$;
    }

    private pipeTimeOutControlOn<T>(in$: Observable<T>, timeoutPeriods: number[]): Observable<T> {
        const timeOutAfterSeconds = timeoutPeriods[0];
        console.info(`Piping timeout control with ${timeOutAfterSeconds} seconds.`);
        const out$ = in$.pipe(timeout(timeOutAfterSeconds * 1000));
        return out$;
    }

    private pipeRetryMechanismOn<T>(in$: Observable<T>, artificialDelayContext: ArtificialDelayContext): Observable<T> {
        const retryStrategy = (errors) => {
            return errors.pipe(
                mergeMap((error: Error, i) => {
                    console.error(`Mapping error ${error?.name}, ${i}`);
                    console.error(error);
                    if (error?.name === 'TimeoutError' && i === 0) {
                        artificialDelayContext.turnOffArtificialDelays();
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

    private pipeArtificialDelayOn<T>(in$: Observable<T>, artificialDelayContext: ArtificialDelayContext): Observable<T> {
        let out$ = in$.pipe(tap(() => {
            console.log(`Artificially delaying for ${artificialDelayContext.getActualDelay()} seconds..`);
        }));
        out$ = out$.pipe(delayWhen(() => timer(artificialDelayContext.getActualDelay() * 1000)));
        out$ = out$.pipe(tap(() => {
            console.log(`Artificially delayed for ${artificialDelayContext.getActualDelay()} seconds..`);
        }));
        return out$;
    }
}
