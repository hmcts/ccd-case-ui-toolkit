import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MockRpxTranslatePipe } from '../../../../../test/mock-rpx-translate.pipe';
import { AddCommentsErrorMessage, AddCommentsStep, CaseFlagFieldState, CaseFlagFormFields, CaseFlagWizardStepTitle } from '../../enums';
import { AddCommentsComponent } from './add-comments.component';

describe('AddCommentsComponent', () => {
  let component: AddCommentsComponent;
  let fixture: ComponentFixture<AddCommentsComponent>;
  let textareaInput: string;
  // Code for "Other" flag type as defined in Reference Data
  const otherFlagTypeCode = 'OT0001';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AddCommentsComponent, MockRpxTranslatePipe]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCommentsComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});
    // 200-character text input
    textareaInput = '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' + '5555555555' + '6666666666' +
      '7777777777' + '8888888888' + '9999999999' + '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' +
      '5555555555' + '6666666666' + '7777777777' + '8888888888' + '9999999999';
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should show an error message on clicking "Next" if comments are mandatory but none have been entered', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    component.isDisplayContextParameterExternal = false;
    component.onNext();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_COMMENTS,
      errorMessages: component.errorMessages
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: AddCommentsErrorMessage.FLAG_COMMENTS_NOT_ENTERED,
      fieldId: component.flagCommentsControlName
    });
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(AddCommentsErrorMessage.FLAG_COMMENTS_NOT_ENTERED);
  });

  it('should show an error message on clicking "Next" if comments are mandatory but none have been entered for support request', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    component.isDisplayContextParameterExternal = true;
    component.onNext();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_COMMENTS,
      errorMessages: component.errorMessages
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: AddCommentsErrorMessage.FLAG_COMMENTS_NOT_ENTERED_EXTERNAL,
      fieldId: component.flagCommentsControlName
    });
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(AddCommentsErrorMessage.FLAG_COMMENTS_NOT_ENTERED_EXTERNAL);
  });

  it('should not show an error message on clicking "Next" if comments are not mandatory and none have been entered', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    component.optional = true;
    component.ngOnInit();
    component.onNext();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_COMMENTS,
      errorMessages: component.errorMessages
    });
    expect(component.errorMessages.length).toBe(0);
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should show an error message on clicking "Next" if comments exceed a 200-character limit, regardless of optionality', () => {
    const textarea = fixture.debugElement.nativeElement.querySelector('.govuk-textarea');
    textarea.value = `${textareaInput}0`;
    textarea.dispatchEvent(new Event('input'));
    component.onNext();
    fixture.detectChanges();
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: AddCommentsErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED,
      fieldId: component.flagCommentsControlName
    });
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(AddCommentsErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED);
    // Change flag comments to optional
    component.optional = true;
    component.ngOnInit();
    textarea.value = `${textareaInput}0`;
    textarea.dispatchEvent(new Event('input'));
    component.onNext();
    fixture.detectChanges();
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: AddCommentsErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED,
      fieldId: component.flagCommentsControlName
    });
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(AddCommentsErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED);
  });

  it('should not show an error message if comments equal a 200-character limit, regardless of optionality', () => {
    const textarea = fixture.debugElement.nativeElement.querySelector('.govuk-textarea');
    textarea.value = textareaInput;
    textarea.dispatchEvent(new Event('input'));
    component.onNext();
    fixture.detectChanges();
    expect(component.errorMessages.length).toBe(0);
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
    // Change flag comments to optional
    component.optional = true;
    component.ngOnInit();
    textarea.value = textareaInput;
    textarea.dispatchEvent(new Event('input'));
    component.onNext();
    fixture.detectChanges();
    expect(component.errorMessages.length).toBe(0);
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should show the text "(optional)" in the textarea label if comments are optional', () => {
    component.optional = true;
    component.ngOnInit();
    fixture.detectChanges();
    const flagCommentsLabel = fixture.debugElement.nativeElement.querySelector('.govuk-label--m');
    expect(flagCommentsLabel.textContent).toContain('(optional)');
  });

  it('should not show the text "(optional)" in the textarea label if comments are mandatory', () => {
    const flagCommentsLabel = fixture.debugElement.nativeElement.querySelector('.govuk-label--m');
    expect(flagCommentsLabel.textContent).not.toContain('(optional)');
  });

  it('should set addCommentsTitle to ADD_FLAG_COMMENTS_EXTERNAL_MODE if input isDisplayContextParameterExternal is true', () => {
    expect(component.isDisplayContextParameterExternal).toBe(false);
    expect(component.addCommentsTitle).toBe(CaseFlagWizardStepTitle.ADD_FLAG_COMMENTS);
    component.isDisplayContextParameterExternal = true;
    component.ngOnInit();
    expect(component.addCommentsTitle).toBe(CaseFlagWizardStepTitle.ADD_FLAG_COMMENTS_EXTERNAL_MODE);
  });

  it('should not display the warning text for case workers and internal staff users if Case Flags v2.1 is enabled and the ' +
    'selected flag is of type "Other" and is internally visible only', () => {
    component.isDisplayContextParameterExternal = false;
    component.isDisplayContextParameter2Point1Enabled = true;
    component.formGroup.addControl(CaseFlagFormFields.FLAG_TYPE, new FormControl({ flagCode: otherFlagTypeCode }));
    component.formGroup.addControl(CaseFlagFormFields.IS_VISIBLE_INTERNALLY_ONLY, new FormControl(true));
    fixture.detectChanges();
    const warningTextElement = fixture.debugElement.nativeElement.querySelector('.govuk-warning-text');
    expect(warningTextElement).toBeNull();
  });

  it('should display the warning text for case workers and internal staff users if Case Flags v2.1 is enabled and the ' +
    'selected flag is of type "Other" and is externally visible', () => {
    component.isDisplayContextParameterExternal = false;
    component.isDisplayContextParameter2Point1Enabled = true;
    component.formGroup.addControl(CaseFlagFormFields.FLAG_TYPE, new FormControl({ flagCode: otherFlagTypeCode }));
    component.formGroup.addControl(CaseFlagFormFields.IS_VISIBLE_INTERNALLY_ONLY, new FormControl(false));
    fixture.detectChanges();
    const warningTextElement = fixture.debugElement.nativeElement.querySelector('.govuk-warning-text');
    expect(warningTextElement.textContent.trim()).toContain(AddCommentsStep.WARNING_TEXT);
  });

  it('should display the warning text for case workers and internal staff users if Case Flags v2.1 is enabled and the ' +
    'selected flag is not of type "Other"', () => {
    component.isDisplayContextParameterExternal = false;
    component.isDisplayContextParameter2Point1Enabled = true;
    component.formGroup.addControl(CaseFlagFormFields.FLAG_TYPE, new FormControl({ flagCode: 'ABC' }));
    fixture.detectChanges();
    const warningTextElement = fixture.debugElement.nativeElement.querySelector('.govuk-warning-text');
    expect(warningTextElement.textContent.trim()).toContain(AddCommentsStep.WARNING_TEXT);
  });

  it('should not display the warning text for case workers and internal staff users if Case Flags v2.1 is not enabled', () => {
    component.isDisplayContextParameterExternal = false;
    component.isDisplayContextParameter2Point1Enabled = false;
    fixture.detectChanges();
    const warningTextElement = fixture.debugElement.nativeElement.querySelector('.govuk-warning-text');
    expect(warningTextElement).toBeNull();
  });

  it('should not display the warning text for solicitors and external users', () => {
    component.isDisplayContextParameterExternal = true;
    component.isDisplayContextParameter2Point1Enabled = true;
    fixture.detectChanges();
    const warningTextElement = fixture.debugElement.nativeElement.querySelector('.govuk-warning-text');
    expect(warningTextElement).toBeNull();
  });
});
