import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CaseFlagFieldState, UpdateFlagErrorMessage } from '../../enums';

import { UpdateFlagComponent } from './update-flag.component';

describe('UpdateFlagComponent', () => {
  let component: UpdateFlagComponent;
  let fixture: ComponentFixture<UpdateFlagComponent>;
  let nextButton: any;
  let textareaInput: string;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ UpdateFlagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateFlagComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});
    nextButton = fixture.debugElement.nativeElement.querySelector('button[type="button"]');
    // 200-character text input
    textareaInput = '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' + '5555555555' + '6666666666' +
      '7777777777' + '8888888888' + '9999999999' + '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' + '5555555555' + '6666666666' +
      '7777777777' + '8888888888' + '9999999999';
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should show an error message on clicking "Next" if comments are mandatory but none have been entered', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE,
      errorMessages: component.errorMessages
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED,
      fieldId: component.updateFlagControlName
    });
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED);
  });

  it('should show an error message on clicking "Next" if comments exceed a 200-character limit', () => {
    const textarea = fixture.debugElement.nativeElement.querySelector('.govuk-textarea');
    textarea.value = textareaInput + '0';
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED,
      fieldId: component.updateFlagControlName
    });
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED);
  });

  it('should not show an error message on clicking "Next" if comments equal a 200-character limit', () => {
    const textarea = fixture.debugElement.nativeElement.querySelector('.govuk-textarea');
    textarea.value = textareaInput;
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages.length).toBe(0);
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });
});
