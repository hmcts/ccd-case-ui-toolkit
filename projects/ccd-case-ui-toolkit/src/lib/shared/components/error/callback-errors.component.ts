import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpError } from '../../domain/http';
import { CallbackErrorsContext } from './domain/error-context';

@Component({
  selector: 'ccd-callback-errors',
  templateUrl: './callback-errors.html'
})
export class CallbackErrorsComponent implements OnInit {

  public static readonly TRIGGER_TEXT_SUBMIT = 'Submit';
  public static readonly TRIGGER_TEXT_START = 'Start';
  public static readonly TRIGGER_TEXT_GO = 'Go';
  public static readonly TRIGGER_TEXT_IGNORE = 'Ignore Warning and Go';

  @Input()
  public triggerTextIgnore: string = CallbackErrorsComponent.TRIGGER_TEXT_IGNORE;
  @Input()
  public triggerTextContinue: string = CallbackErrorsComponent.TRIGGER_TEXT_SUBMIT;
  @Input()
  public callbackErrorsSubject: Subject<any> = new Subject();

  @Output()
  public callbackErrorsContext: EventEmitter<CallbackErrorsContext> = new EventEmitter();

  public error: HttpError;

  public ngOnInit(): void {
    this.callbackErrorsSubject.subscribe(errorEvent => {
      this.error = errorEvent;
      if (this.hasWarnings() || this.hasErrors() || this.hasInvalidData()) {
        const callbackErrorsContext: CallbackErrorsContext = this.buildCallbackErrorsContext();
        this.callbackErrorsContext.emit(callbackErrorsContext);
      }
    });
  }

  public hasErrors(): boolean {
    return this.error
      && this.error.callbackErrors
      && this.error.callbackErrors.length;
  }

  public hasWarnings(): boolean {
    return this.error
      && this.error.callbackWarnings
      && this.error.callbackWarnings.length;
  }

  private buildCallbackErrorsContext(): CallbackErrorsContext {
    const errorContext: CallbackErrorsContext = new CallbackErrorsContext();
    if (this.hasWarnings() && !this.hasErrors() && !this.hasInvalidData()) {
      errorContext.ignore_warning = true;
      errorContext.trigger_text = this.triggerTextIgnore;
    } else {
      errorContext.ignore_warning = false;
      errorContext.trigger_text = this.triggerTextContinue;
    }
    return errorContext;
  }

  private hasInvalidData(): boolean {
    return this.error
      && this.error.details
      && this.error.details.field_errors
      && this.error.details.field_errors.length;
  }
}
