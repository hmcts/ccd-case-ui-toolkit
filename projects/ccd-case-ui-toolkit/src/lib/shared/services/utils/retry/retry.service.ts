import { Injectable } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { delayWhen, finalize, mergeMap, retryWhen, tap, timeout } from 'rxjs/operators';
import { StructuredLoggerService } from '../../logging';

class ArtificialDelayContext {
    private artificialDelayOn = true;
    private selectedDelay = this.selectActualDelayTime();
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
    private readonly logger = new StructuredLoggerService();

    public pipeTimeoutMechanismOn<T>(in$: Observable<T>, preferredArtificialDelay: number, timeoutPeriods: number[]): Observable<T> {
        const artificialDelayContext = new ArtificialDelayContext(preferredArtificialDelay);
        this.logger.info('Piping a retry mechanism with timeouts.', { timeoutPeriods });
        this.logger.info('Artificial delay setting resolved.', { artificialDelayApplied: artificialDelayContext.shouldApplyArtificialDelay() });

        let out$ = in$;
        if (artificialDelayContext.shouldApplyArtificialDelay()) {
            this.logger.info('Preferred artificial delay selected.', {
                actualDelaySeconds: artificialDelayContext.getActualDelay(),
                preferredDelaySeconds: preferredArtificialDelay
            });
            out$ = this.pipeArtificialDelayOn(out$, artificialDelayContext);
        }
        out$ = this.pipeTimeOutControlOn(out$, timeoutPeriods);
        out$ = this.pipeRetryMechanismOn(out$, artificialDelayContext);
        return out$;
    }

    private pipeTimeOutControlOn<T>(in$: Observable<T>, timeoutPeriods: number[]): Observable<T> {
        const timeOutAfterSeconds = timeoutPeriods[0];
        this.logger.info('Piping timeout control.', { timeoutSeconds: timeOutAfterSeconds });
        const out$ = in$.pipe(timeout(timeOutAfterSeconds * 1000));
        return out$;
    }

    private pipeRetryMechanismOn<T>(in$: Observable<T>, artificialDelayContext: ArtificialDelayContext): Observable<T> {
        const retryStrategy = (errors) => {
            return errors.pipe(
                mergeMap((error: Error, i) => {
                    this.logger.error('Mapping retry error.', { error, errorName: error?.name, attempt: i });
                    if (error?.name === 'TimeoutError' && i === 0) {
                        artificialDelayContext.turnOffArtificialDelays();
                        this.logger.info('Will retry after a timeout error.');
                    }
                    else {
                        this.logger.error('Will not retry request after error.', { error, errorName: error?.name, attempt: i });
                        throw error;
                    }
                    return timer(0);
                }),
                finalize(() => undefined));
        };
        const out$ = in$.pipe(retryWhen(retryStrategy));
        return out$;
    }

    private pipeArtificialDelayOn<T>(in$: Observable<T>, artificialDelayContext: ArtificialDelayContext): Observable<T> {
        let out$ = in$.pipe(tap(() => {
            this.logger.info('Artificial delay started.', { delaySeconds: artificialDelayContext.getActualDelay() });
        }));
        out$ = out$.pipe(delayWhen(() => timer(artificialDelayContext.getActualDelay() * 1000)));
        out$ = out$.pipe(tap(() => {
            this.logger.info('Artificial delay completed.', { delaySeconds: artificialDelayContext.getActualDelay() });
        }));
        return out$;
    }
}
