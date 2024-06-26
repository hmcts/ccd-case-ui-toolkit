import { HttpErrorResponse } from '@angular/common/http';
import { DebugElement, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { HttpError } from '../../domain/http';
import { text } from '../../test/helpers';
import { MockRpxTranslatePipe } from '../../test/mock-rpx-translate.pipe';
import { CallbackErrorsComponent } from './callback-errors.component';
import { CallbackErrorsContext } from './domain/error-context';
import createSpyObj = jasmine.createSpyObj;

describe('CallbackErrorsComponent', () => {

  const VALID_WARNING = {
    callbackErrors: [],
    callbackWarnings: ['callbackWarning1', 'callbackWarning2'],
    eventId: undefined
  };

  const VALID_ERROR = {
    callbackErrors: ['callbackError1', 'callbackError2'],
    callbackWarnings: []
  };

  const VALID_INVALID_DATA = {
    details: {
      field_errors: ['fieldError1', 'fieldError2']
    }
  };

  const $ERROR_SUMMARY = By.css('.error-summary');
  const $ERROR_MESSAGES = By.css('#errors');
  const $WARNING_MESSAGES = By.css('#warnings');

  let fixture: ComponentFixture<CallbackErrorsComponent>;
  let component: CallbackErrorsComponent;
  let de: DebugElement;
  const triggerTextIgnore = 'Ignore Warnings and Submit test';
  const triggerTextContinue = 'Submit test';
  let callbackErrorsSubject: any;
  let mockCallbackErrorsContext: any;

  beforeEach(waitForAsync(() => {
    mockCallbackErrorsContext = createSpyObj<EventEmitter<any>>('callbackErrorsContext', ['emit']);

    callbackErrorsSubject = new Subject();

    TestBed
      .configureTestingModule({
        declarations: [
          CallbackErrorsComponent,
          MockRpxTranslatePipe
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CallbackErrorsComponent);
    component = fixture.componentInstance;
    component.triggerTextIgnore = triggerTextIgnore;
    component.triggerTextContinue = triggerTextContinue;
    component.callbackErrorsSubject = callbackErrorsSubject;
    component.callbackErrorsContext = mockCallbackErrorsContext;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should have ignore warning label if notified about error with warnings but no errors set', () => {
    const error = HttpError.from(new HttpErrorResponse({ error: VALID_WARNING }));
    callbackErrorsSubject.next(error);

    const expectedCallbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    expectedCallbackErrorsContext.ignoreWarning = true;
    expectedCallbackErrorsContext.triggerText = triggerTextIgnore;
    expectedCallbackErrorsContext.eventId = undefined;
    expect(mockCallbackErrorsContext.emit).toHaveBeenCalledWith(expectedCallbackErrorsContext);
  });

  it('should not have ignore warning label if notified about error with warnings and errors set', () => {
    const error = HttpError.from(new HttpErrorResponse({ error: VALID_WARNING }));
    error.callbackErrors = ['error1', 'error2'];
    callbackErrorsSubject.next(error);

    const expectedCallbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    expectedCallbackErrorsContext.ignoreWarning = false;
    expectedCallbackErrorsContext.triggerText = triggerTextContinue;
    expectedCallbackErrorsContext.eventId = undefined;
    expect(mockCallbackErrorsContext.emit).toHaveBeenCalledWith(expectedCallbackErrorsContext);
  });

  it('should not have ignore warning label if notified about callback error and no warnings but errors set', () => {
    const error = HttpError.from(new HttpErrorResponse({ error: VALID_ERROR }));
    callbackErrorsSubject.next(error);

    const expectedCallbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    expectedCallbackErrorsContext.ignoreWarning = false;
    expectedCallbackErrorsContext.triggerText = triggerTextContinue;
    expectedCallbackErrorsContext.eventId = undefined;
    expect(mockCallbackErrorsContext.emit).toHaveBeenCalledWith(expectedCallbackErrorsContext);
  });

  it('should display callback warnings when warnings get set', () => {
    component.error = HttpError.from(new HttpErrorResponse({ error: VALID_WARNING }));
    fixture.detectChanges();

    const error = de.query($ERROR_SUMMARY);
    expect(error).toBeTruthy();

    const warningMessages = error.query($WARNING_MESSAGES);
    expect(text(warningMessages.children[0])).toBe(VALID_WARNING.callbackWarnings[0]);
    expect(text(warningMessages.children[1])).toBe(VALID_WARNING.callbackWarnings[1]);
  });

  it('should display callback errors when errors get set', () => {
    component.error = HttpError.from(new HttpErrorResponse({ error: VALID_ERROR }));
    fixture.detectChanges();

    const error = de.query($ERROR_SUMMARY);
    expect(error).toBeTruthy();

    const errorMessages = error.query($ERROR_MESSAGES);
    expect(text(errorMessages.children[0])).toBe(VALID_ERROR.callbackErrors[0]);
    expect(text(errorMessages.children[1])).toBe(VALID_ERROR.callbackErrors[1]);
  });

  it('should still notify about error details if error with field errors set', () => {
    const FIELD_ERRORS = [
      {
        x: ''
      }
    ];
    const VALID_ERROR_NO_CALLBACK_WARNINGS_OR_ERRORS = {
      details: {
        field_errors: FIELD_ERRORS
      }
    };
    const httpError = HttpError.from(new HttpErrorResponse({ error: VALID_ERROR_NO_CALLBACK_WARNINGS_OR_ERRORS }));
    httpError.callbackWarnings = [];
    httpError.callbackErrors = [];
    callbackErrorsSubject.next(httpError);

    expect(component.error).toEqual(httpError);
    const expectedCallbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    expectedCallbackErrorsContext.ignoreWarning = false;
    expectedCallbackErrorsContext.triggerText = triggerTextContinue;
    expectedCallbackErrorsContext.eventId = undefined;
    expect(mockCallbackErrorsContext.emit).toHaveBeenCalledWith(expectedCallbackErrorsContext);
  });

  it('should build callback errors context with eventId if available', () => {
    const VALID_ERROR_WITH_EVENT_ID = {
      callbackErrors: ['callbackError1'],
      callbackWarnings: [],
      details: {
        eventId: '1234'
      }
    };

    const error = HttpError.from(new HttpErrorResponse({ error: VALID_ERROR_WITH_EVENT_ID }));
    callbackErrorsSubject.next(error);

    const expectedCallbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    expectedCallbackErrorsContext.ignoreWarning = false;
    expectedCallbackErrorsContext.triggerText = triggerTextContinue;
    expectedCallbackErrorsContext.eventId = '1234';
    expect(mockCallbackErrorsContext.emit).toHaveBeenCalledWith(expectedCallbackErrorsContext);
  });

  it('should handle errors with invalid data', () => {
    const error = HttpError.from(new HttpErrorResponse({ error: VALID_INVALID_DATA }));
    callbackErrorsSubject.next(error);

    const expectedCallbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    expectedCallbackErrorsContext.ignoreWarning = false;
    expectedCallbackErrorsContext.triggerText = triggerTextContinue;
    expectedCallbackErrorsContext.eventId = undefined;
    expect(mockCallbackErrorsContext.emit).toHaveBeenCalledWith(expectedCallbackErrorsContext);
  });

  it('should handle errors with no callbackErrors, callbackWarnings, or field_errors', () => {
    const EMPTY_ERROR = {
      details: {}
    };

    const error = HttpError.from(new HttpErrorResponse({ error: EMPTY_ERROR }));
    callbackErrorsSubject.next(error);

    expect(component.error).toEqual(error);
  });
});
