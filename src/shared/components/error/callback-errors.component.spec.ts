import { HttpErrorResponse } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { CallbackErrorsComponent } from './callback-errors.component';
import createSpyObj = jasmine.createSpyObj;
import { CallbackErrorsContext } from './domain/error-context';
import { By } from '@angular/platform-browser';
import { text } from '../../test/helpers';
import { HttpError } from '../../domain/http';

describe('CallbackErrorsComponent', () => {

  const VALID_WARNING = {
    callbackErrors: [],
    callbackWarnings: ['callbackWarning1', 'callbackWarning2']
  };

  const VALID_ERROR = {
    callbackErrors: ['callbackError1', 'callbackError2'],
    callbackWarnings: []
  };

  const $ERROR_SUMMARY = By.css('.error-summary');
  const $ERROR_MESSAGES = By.css('#errors');
  const $WARNING_MESSAGES = By.css('#warnings');

  let fixture: ComponentFixture<CallbackErrorsComponent>;
  let component: CallbackErrorsComponent;
  let de: DebugElement;
  let triggerTextIgnore = 'Ignore Warnings and Submit test';
  let triggerTextContinue = 'Submit test';
  let callbackErrorsSubject: any;
  let mockCallbackErrorsContext: any;

  beforeEach(async(() => {
    mockCallbackErrorsContext = createSpyObj<EventEmitter<any>>('callbackErrorsContext', ['emit']);

    callbackErrorsSubject = new Subject();

    TestBed
      .configureTestingModule({
        declarations: [
          CallbackErrorsComponent
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
    expectedCallbackErrorsContext.ignore_warning = true;
    expectedCallbackErrorsContext.trigger_text = triggerTextIgnore;
    expect(mockCallbackErrorsContext.emit).toHaveBeenCalledWith(expectedCallbackErrorsContext);
  });

  it('should not have ignore warning label if notified about error with warnings and errors set', () => {
    const error = HttpError.from(new HttpErrorResponse({ error: VALID_WARNING }));
    error.callbackErrors = ['error1', 'error2'];
    callbackErrorsSubject.next(error);

    const expectedCallbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    expectedCallbackErrorsContext.ignore_warning = false;
    expectedCallbackErrorsContext.trigger_text = triggerTextContinue;
    expect(mockCallbackErrorsContext.emit).toHaveBeenCalledWith(expectedCallbackErrorsContext);
  });

  it('should not have ignore warning label if notified about callback error and no warnings but errors set', () => {
    const error = HttpError.from(new HttpErrorResponse({ error: VALID_ERROR }));
    callbackErrorsSubject.next(error);

    const expectedCallbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    expectedCallbackErrorsContext.ignore_warning = false;
    expectedCallbackErrorsContext.trigger_text = triggerTextContinue;
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
    expectedCallbackErrorsContext.ignore_warning = false;
    expectedCallbackErrorsContext.trigger_text = triggerTextContinue;
    expect(mockCallbackErrorsContext.emit).toHaveBeenCalledWith(expectedCallbackErrorsContext);
  });

});
