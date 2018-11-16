import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { CallbackErrorsContext } from './domain/error-context';
import { HttpError } from '../../domain/http';

@Component({
  selector: 'ccd-callback-errors',
  templateUrl: './callback-errors.html'
})
export class CallbackErrorsComponent implements OnInit, OnDestroy {

  public static readonly TRIGGER_TEXT_SUBMIT = 'Submit';
  public static readonly TRIGGER_TEXT_START = 'Start';
  public static readonly TRIGGER_TEXT_GO = 'Go';
  public static readonly TRIGGER_TEXT_IGNORE = 'Ignore Warning and Go';

  @Input()
  triggerTextIgnore: string = CallbackErrorsComponent.TRIGGER_TEXT_IGNORE;
  @Input()
  triggerTextContinue: string = CallbackErrorsComponent.TRIGGER_TEXT_SUBMIT;
  @Input()
  callbackErrorsSubject: Subject<any> = new Subject();

  @Output()
  callbackErrorsContext: EventEmitter<CallbackErrorsContext> = new EventEmitter();

  error: HttpError;

  ngOnInit(): void {
    this.callbackErrorsSubject.subscribe(errorEvent => {
      this.error = errorEvent;
      if (this.hasWarnings() || this.hasErrors() || this.hasInvalidData()) {
        let callbackErrorsContext: CallbackErrorsContext = this.buildCallbackErrorsContext();
        this.callbackErrorsContext.emit(callbackErrorsContext);
      }
    });
  }

  ngOnDestroy() {
    this.callbackErrorsSubject.unsubscribe();
  }

  private buildCallbackErrorsContext(): CallbackErrorsContext {
    let errorContext: CallbackErrorsContext = new CallbackErrorsContext();
    if (this.hasWarnings() && !this.hasErrors() && !this.hasInvalidData()) {
      errorContext.ignore_warning = true;
      errorContext.trigger_text = this.triggerTextIgnore;
    } else {
      errorContext.ignore_warning = false;
      errorContext.trigger_text = this.triggerTextContinue;
    }
    return errorContext;
  }

  hasErrors(): boolean {
    return this.error
      && this.error.callbackErrors
      && this.error.callbackErrors.length;
  }

  hasWarnings(): boolean {
    return this.error
      && this.error.callbackWarnings
      && this.error.callbackWarnings.length;
  }

  private hasInvalidData(): boolean {
    return this.error
      && this.error.details
      && this.error.details.field_errors
      && this.error.details.field_errors.length;
  }
}
