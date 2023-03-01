import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CaseFlagFieldState, ConfirmStatusErrorMessage } from '../../enums';
import { ConfirmFlagStatusComponent } from './confirm-flag-status.component';

describe('ConfirmFlagStatusComponent', () => {
  let component: ConfirmFlagStatusComponent;
  let fixture: ComponentFixture<ConfirmFlagStatusComponent>;
  let nextButton: any;
  let textareaInput: string;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ ConfirmFlagStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmFlagStatusComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});
    nextButton = fixture.debugElement.nativeElement.querySelector('button[type="button"]');
    // 200-character text input
    textareaInput = '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' + '5555555555' + '6666666666' +
      '7777777777' + '8888888888' + '9999999999' + '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' +
      '5555555555' + '6666666666' + '7777777777' + '8888888888' + '9999999999';
    // Deliberately omitted fixture.detectChanges() here to allow for a different flag default status to be set for each
    // test
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should pre-select the flag status according to the default status of "Requested"', () => {
    component.defaultStatus = 'Requested';
    fixture.detectChanges();
    const radioButtons = fixture.debugElement.nativeElement.querySelectorAll('.govuk-radios__input') as HTMLInputElement[];
    // First radio button with status "Requested" is expected to be selected
    expect(radioButtons[0].checked).toBe(true);
    expect(radioButtons[1].checked).toBe(false);
    expect(radioButtons[2].checked).toBe(false);
  });

  it('should pre-select the flag status according to the default status of "Active"', () => {
    component.defaultStatus = 'Active';
    fixture.detectChanges();
    const radioButtons = fixture.debugElement.nativeElement.querySelectorAll('.govuk-radios__input') as HTMLInputElement[];
    // Second radio button with status "Active" is expected to be selected
    expect(radioButtons[0].checked).toBe(false);
    expect(radioButtons[1].checked).toBe(true);
    expect(radioButtons[2].checked).toBe(false);
  });

  it('should show an error message on clicking "Next" if comments are mandatory but none have been entered', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    fixture.detectChanges();
    const radioButtons = fixture.debugElement.nativeElement.querySelectorAll('.govuk-radios__input') as HTMLInputElement[];
    // Clicking third radio button with status "Not approved" makes entering comments mandatory
    radioButtons[2].click();
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_STATUS,
      errorMessages: component.errorMessages
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: ConfirmStatusErrorMessage.STATUS_REASON_NOT_ENTERED,
      fieldId: component.statusReasonControlName
    });
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ConfirmStatusErrorMessage.STATUS_REASON_NOT_ENTERED);
  });

  it('should not show an error message on clicking "Next" if comments are not mandatory and none have been entered', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    fixture.detectChanges();
    const radioButtons = fixture.debugElement.nativeElement.querySelectorAll('.govuk-radios__input') as HTMLInputElement[];
    // Clicking first radio button with status "Requested" makes entering comments optional
    radioButtons[0].click();
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_STATUS,
      errorMessages: component.errorMessages
    });
    expect(component.errorMessages.length).toBe(0);
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
    // Clicking second radio button with status "Active" makes entering comments optional
    radioButtons[1].click();
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_STATUS,
      errorMessages: component.errorMessages
    });
    expect(component.errorMessages.length).toBe(0);
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should show an error message on clicking "Next" if comments exceed a 200-character limit, regardless of optionality', () => {
    fixture.detectChanges();
    const radioButtons = fixture.debugElement.nativeElement.querySelectorAll('.govuk-radios__input') as HTMLInputElement[];
    // Clicking first radio button with status "Requested" makes entering comments optional
    radioButtons[0].click();
    const textarea = fixture.debugElement.nativeElement.querySelector('.govuk-textarea');
    textarea.value = `${textareaInput}0`;
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: ConfirmStatusErrorMessage.STATUS_REASON_CHAR_LIMIT_EXCEEDED,
      fieldId: component.statusReasonControlName
    });
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ConfirmStatusErrorMessage.STATUS_REASON_CHAR_LIMIT_EXCEEDED);
    // Clicking third radio button with status "Not approved" makes entering comments mandatory
    radioButtons[2].click();
    textarea.value = `${textareaInput}0`;
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: ConfirmStatusErrorMessage.STATUS_REASON_CHAR_LIMIT_EXCEEDED,
      fieldId: component.statusReasonControlName
    });
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ConfirmStatusErrorMessage.STATUS_REASON_CHAR_LIMIT_EXCEEDED);
  });

  it('should not show an error message if comments equal a 200-character limit, regardless of optionality', () => {
    fixture.detectChanges();
    const radioButtons = fixture.debugElement.nativeElement.querySelectorAll('.govuk-radios__input') as HTMLInputElement[];
    // Clicking first radio button with status "Requested" makes entering comments optional
    radioButtons[0].click();
    const textarea = fixture.debugElement.nativeElement.querySelector('.govuk-textarea');
    textarea.value = textareaInput;
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages.length).toBe(0);
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
    // Clicking third radio button with status "Not approved" makes entering comments mandatory
    radioButtons[2].click();
    textarea.value = textareaInput;
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages.length).toBe(0);
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });
});
