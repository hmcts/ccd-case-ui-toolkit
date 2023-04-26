import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RpxTranslationService } from 'rpx-xui-translation';
import { FlagDetail, FlagDetailDisplayWithFormGroupPath } from '../../domain';
import { CaseFlagDisplayContextParameter, CaseFlagFieldState, CaseFlagFormFields, CaseFlagStatus, CaseFlagWizardStepTitle, UpdateFlagErrorMessage } from '../../enums';
import { UpdateFlagComponent } from './update-flag.component';
import { MockRpxTranslatePipe } from '../../../../../../shared/test/mock-rpx-translate.pipe';

describe('UpdateFlagComponent', () => {
  let component: UpdateFlagComponent;
  let fixture: ComponentFixture<UpdateFlagComponent>;
  let nextButton: HTMLElement;
  let textareaInput: string;
  let rpxTranslationServiceSpy: jasmine.SpyObj<RpxTranslationService>;
  const activeFlag = {
    name: 'Flag 1',
    flagComment: 'First flag',
    flagComment_cy: 'Cymraeg',
    dateTimeCreated: new Date(),
    path: [{id: null, value: 'Reasonable adjustment'}],
    hearingRelevant: false,
    flagCode: 'FL1',
    status: 'Active'
  } as FlagDetail;
  const inactiveFlag = {
    name: 'Flag 2',
    dateTimeCreated: new Date(),
    path: [{id: null, value: 'Reasonable adjustment'}],
    hearingRelevant: false,
    flagCode: 'FL2',
    status: 'Inactive'
  } as FlagDetail;
  const requestedFlag = {
    name: 'Flag 3',
    dateTimeCreated: new Date(),
    path: [{id: null, value: 'Reasonable adjustment'}],
    hearingRelevant: false,
    flagCode: 'FL3',
    status: 'Requested'
  } as FlagDetail;
  const notApprovedFlag = {
    name: 'Flag 4',
    dateTimeCreated: new Date(),
    path: [{id: null, value: 'Reasonable adjustment'}],
    hearingRelevant: false,
    flagCode: 'FL4',
    status: 'Not approved'
  } as FlagDetail;
  const activeFlagWithSubTypeValue = {
    name: 'Flag 1',
    flagComment: 'First flag',
    flagComment_cy: 'Cymraeg',
    dateTimeCreated: new Date(),
    path: [{id: null, value: 'Reasonable adjustment'}],
    hearingRelevant: false,
    flagCode: 'FL1',
    status: 'Active',
    subTypeValue: 'Sub Type'
  } as FlagDetail;
  const selectedFlag1 = {
    flagDetailDisplay: {
      partyName: 'Rose Bank',
      flagDetail: activeFlag,
    },
    pathToFlagsFormGroup: ''
  } as FlagDetailDisplayWithFormGroupPath;
  const selectedFlag2 = {
    flagDetailDisplay: {
      partyName: 'Rose Bank',
      flagDetail: inactiveFlag
    },
    pathToFlagsFormGroup: ''
  } as FlagDetailDisplayWithFormGroupPath;
  const selectedFlag3 = {
    flagDetailDisplay: {
      partyName: 'Rose Bank',
      flagDetail: requestedFlag
    },
    pathToFlagsFormGroup: ''
  } as FlagDetailDisplayWithFormGroupPath;
  const selectedFlag4 = {
    flagDetailDisplay: {
      partyName: 'Rose Bank',
      flagDetail: notApprovedFlag
    },
    pathToFlagsFormGroup: ''
  } as FlagDetailDisplayWithFormGroupPath;

  beforeEach(waitForAsync(() => {
    rpxTranslationServiceSpy = jasmine.createSpyObj('RpxTranslationService', ['']);
    rpxTranslationServiceSpy.language = 'en';
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [UpdateFlagComponent, MockRpxTranslatePipe],
      providers: [
        { provide: RpxTranslationService, useValue: rpxTranslationServiceSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateFlagComponent);
    component = fixture.componentInstance;
    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE;
    component.formGroup = new FormGroup({
      selectedManageCaseLocation: new FormControl(selectedFlag1)
    });

    // 200-character text input
    textareaInput = '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' + '5555555555' + '6666666666' +
      '7777777777' + '8888888888' + '9999999999' + '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' +
      '5555555555' + '6666666666' + '7777777777' + '8888888888' + '9999999999';
    // Deliberately omitted fixture.detectChanges() here to allow for a different selected flag to be set for each test

    nextButton = fixture.debugElement.query(By.css('#updateFlagNextButton')).nativeElement;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the flag comments textarea from English comments field when selected language is English (default)', () => {
    component.selectedFlag = selectedFlag1;
    fixture.detectChanges();
    // Check the textarea value property, rather than textContent, because this input element has no child nodes
    const textarea = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS}`)).nativeElement;
    expect(textarea.value).toEqual(activeFlag.flagComment);
  });

  it('should populate the flag comments textarea from Welsh comments field when only Welsh comments are available', () => {
    selectedFlag1.flagDetailDisplay.flagDetail.flagComment = null;
    component.selectedFlag = selectedFlag1;
    fixture.detectChanges();
    // Check the textarea value property, rather than textContent, because this input element has no child nodes
    const textarea = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS}`)).nativeElement;
    expect(textarea.value).toEqual(activeFlag.flagComment_cy);
  });

  it('should populate the flag comments textarea from Welsh comments field when selected language is Welsh', () => {
    rpxTranslationServiceSpy.language = 'cy';
    selectedFlag1.flagDetailDisplay.flagDetail.flagComment = 'First flag';
    component.selectedFlag = selectedFlag1;
    fixture.detectChanges();
    // Check the textarea value property, rather than textContent, because this input element has no child nodes
    const textarea = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS}`)).nativeElement;
    expect(textarea.value).toEqual(activeFlag.flagComment_cy);
  });

  it('should populate from English comments field when the selected language is Welsh but there are no Welsh comments', () => {
    rpxTranslationServiceSpy.language = 'cy';
    selectedFlag1.flagDetailDisplay.flagDetail.flagComment_cy = null;
    component.selectedFlag = selectedFlag1;
    fixture.detectChanges();
    // Check the textarea value property, rather than textContent, because this input element has no child nodes
    const textarea = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS}`)).nativeElement;
    expect(textarea.value).toEqual(activeFlag.flagComment);
  });

  it('should show an error message on clicking "Next" if existing comments have been deleted', () => {
    selectedFlag1.flagDetailDisplay.flagDetail.flagComment = 'First flag';
    selectedFlag1.flagDetailDisplay.flagDetail.flagComment_cy = null;
    component.selectedFlag = selectedFlag1;
    fixture.detectChanges();
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    // Delete existing flag comments
    const textarea = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS}`)).nativeElement;
    textarea.value = '';
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE,
      errorMessages: component.errorMessages,
      selectedFlag: component.selectedFlag
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED,
      fieldId: CaseFlagFormFields.COMMENTS
    });
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED);
  });

  it('should show correct error message for support request on clicking "Next" if existing comments have been deleted', () => {
    selectedFlag1.flagDetailDisplay.flagDetail.flagComment = 'First flag';
    selectedFlag1.flagDetailDisplay.flagDetail.flagComment_cy = null;
    component.selectedFlag = selectedFlag1;
    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE_EXTERNAL;
    fixture.detectChanges();
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    // Delete existing flag comments
    const textarea = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS}`)).nativeElement;
    textarea.value = '';
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE,
      errorMessages: component.errorMessages,
      selectedFlag: component.selectedFlag
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED_EXTERNAL,
      fieldId: CaseFlagFormFields.COMMENTS
    });
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED_EXTERNAL);
  });

  it('should show no error message if displayContextParameter is empty and clicked on "Next" button if existing comments have been deleted', () => {
    selectedFlag1.flagDetailDisplay.flagDetail.flagComment = 'First flag';
    selectedFlag1.flagDetailDisplay.flagDetail.flagComment_cy = null;
    component.selectedFlag = selectedFlag1;
    component.displayContextParameter = '';
    fixture.detectChanges();
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    // Delete existing flag comments
    const textarea = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS}`)).nativeElement;
    textarea.value = '';
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(fixture.debugElement.nativeElement.querySelector('.govuk-error-message')).toBeNull();
  });

  it('should show an error message on clicking "Next" if existing comments in Welsh have been deleted', () => {
    selectedFlag1.flagDetailDisplay.flagDetail.flagComment = null;
    selectedFlag1.flagDetailDisplay.flagDetail.flagComment_cy = 'Cymraeg';
    component.selectedFlag = selectedFlag1;
    fixture.detectChanges();
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    // Delete existing flag comments
    const textarea = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS}`)).nativeElement;
    textarea.value = '';
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE,
      errorMessages: component.errorMessages,
      selectedFlag: component.selectedFlag
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED,
      fieldId: CaseFlagFormFields.COMMENTS
    });
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED);
  });

  it('should not show an error message on clicking "Next" if no comments exist and none have been entered', () => {
    component.formGroup = new FormGroup({
      selectedManageCaseLocation: new FormControl(selectedFlag2)
    });
    fixture.detectChanges();
    const textarea = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS}`)).nativeElement;
    expect(textarea.value).toEqual('');
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages.length).toBe(0);
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should show an error message on clicking "Next" if comments exceed a 200-character limit', () => {
    component.selectedFlag = selectedFlag1;
    fixture.detectChanges();
    const textarea = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS}`)).nativeElement;
    textarea.value = `${textareaInput}0`;
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED,
      fieldId: CaseFlagFormFields.COMMENTS
    });
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED);
  });

  it('should not show an error message on clicking "Next" if comments equal a 200-character limit', () => {
    component.selectedFlag = selectedFlag1;
    fixture.detectChanges();
    const textarea = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS}`)).nativeElement;
    textarea.value = textareaInput;
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages.length).toBe(0);
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should render flag status radio buttons correctly when current flag status is "Requested"', () => {
    component.formGroup = new FormGroup({
      selectedManageCaseLocation: new FormControl(selectedFlag3)
    });
    fixture.detectChanges();
    const statusCheckboxLabelsElements = fixture.debugElement.nativeElement.querySelectorAll(`#${CaseFlagFormFields.STATUS} label`);

    const displayedStatuses = [] as string[];
    for (const element of statusCheckboxLabelsElements.values()) {
      displayedStatuses.push(element.textContent.trim());
    }

    expect(displayedStatuses).toEqual(Object.values(CaseFlagStatus));
  });

  it('should render flag status radio buttons correctly when current flag status is "Active"', () => {
    component.selectedFlag = selectedFlag1;
    fixture.detectChanges();
    const statusCheckboxLabelsElements = fixture.debugElement.nativeElement.querySelectorAll(`#${CaseFlagFormFields.STATUS} label`);

    const displayedStatuses = [] as string[];
    for (const element of statusCheckboxLabelsElements.values()) {
      displayedStatuses.push(element.textContent.trim());
    }

    expect(displayedStatuses).toEqual([CaseFlagStatus.ACTIVE, CaseFlagStatus.INACTIVE]);
  });

  it('should not render any flag status radio buttons when current flag status is "Inactive"', () => {
    component.formGroup = new FormGroup({
      selectedManageCaseLocation: new FormControl(selectedFlag2)
    });
    component.selectedFlag = selectedFlag2;
    fixture.detectChanges();
  });

  it('should not render any flag status radio buttons when current flag status is "Not approved"', () => {
    component.formGroup = new FormGroup({
      selectedManageCaseLocation: new FormControl(selectedFlag4)
    });
    fixture.detectChanges();
    const statusCheckboxLabelsElements = fixture.debugElement.nativeElement.querySelectorAll(`#${CaseFlagFormFields.STATUS} label`);

    expect(statusCheckboxLabelsElements.length).toBe(0);
  });

  it('should show an error message on clicking "Next" if status reason is mandatory but none has been entered', () => {
    // Select flag with current status of "Requested", so that all status radio buttons are displayed
    component.formGroup = new FormGroup({
      selectedManageCaseLocation: new FormControl(selectedFlag3)
    });
    fixture.detectChanges();
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    const radioButtons = fixture.debugElement.nativeElement.querySelectorAll('.govuk-radios__input') as HTMLInputElement[];
    // Clicking fourth radio button with status "Not approved" makes entering status reason mandatory
    radioButtons[3].click();
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE,
      errorMessages: component.errorMessages,
      selectedFlag: component.selectedFlag
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: UpdateFlagErrorMessage.STATUS_REASON_NOT_ENTERED,
      fieldId: CaseFlagFormFields.STATUS_CHANGE_REASON
    });
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(UpdateFlagErrorMessage.STATUS_REASON_NOT_ENTERED);
  });

  it('should not show an error message on clicking "Next" if status reason is not mandatory and none has been entered', () => {
    // Select flag with current status of "Requested", so that all status radio buttons are displayed
    component.formGroup = new FormGroup({
      selectedManageCaseLocation: new FormControl(selectedFlag3)
    });
    fixture.detectChanges();
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    const radioButtons = fixture.debugElement.nativeElement.querySelectorAll('.govuk-radios__input') as HTMLInputElement[];
    // Clicking first radio button with status "Requested" makes entering status reason optional
    radioButtons[0].click();
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE,
      errorMessages: component.errorMessages,
      selectedFlag: component.selectedFlag
    });
    expect(component.errorMessages.length).toBe(0);
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
    // Clicking second radio button with status "Active" makes entering status reason optional
    radioButtons[1].click();
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE,
      errorMessages: component.errorMessages,
      selectedFlag: component.selectedFlag
    });
    expect(component.errorMessages.length).toBe(0);
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
    // Clicking third radio button with status "Inactive" makes entering status reason optional
    radioButtons[2].click();
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE,
      errorMessages: component.errorMessages,
      selectedFlag: component.selectedFlag
    });
    expect(component.errorMessages.length).toBe(0);
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should show an error message on clicking "Next" if status reason exceeds 200-character limit, regardless of optionality', () => {
    // Select flag with current status of "Requested", so that all status radio buttons are displayed
    component.formGroup = new FormGroup({
      selectedManageCaseLocation: new FormControl(selectedFlag3)
    });
    fixture.detectChanges();
    const radioButtons = fixture.debugElement.nativeElement.querySelectorAll('.govuk-radios__input') as HTMLInputElement[];
    // Clicking first radio button with status "Requested" makes entering status reason optional
    radioButtons[0].click();
    const textarea = fixture.debugElement.nativeElement.querySelector(`#${CaseFlagFormFields.STATUS_CHANGE_REASON}`);
    textarea.value = `${textareaInput}0`;
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: UpdateFlagErrorMessage.STATUS_REASON_CHAR_LIMIT_EXCEEDED,
      fieldId: CaseFlagFormFields.STATUS_CHANGE_REASON
    });
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(UpdateFlagErrorMessage.STATUS_REASON_CHAR_LIMIT_EXCEEDED);
    // Clicking fourth radio button with status "Not approved" makes entering status reason mandatory
    radioButtons[3].click();
    textarea.value = `${textareaInput}0`;
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: UpdateFlagErrorMessage.STATUS_REASON_CHAR_LIMIT_EXCEEDED,
      fieldId: CaseFlagFormFields.STATUS_CHANGE_REASON
    });
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(UpdateFlagErrorMessage.STATUS_REASON_CHAR_LIMIT_EXCEEDED);
  });

  it('should not show an error message if status reason equals a 200-character limit, regardless of optionality', () => {
    // Select flag with current status of "Requested", so that all status radio buttons are displayed
    component.formGroup = new FormGroup({
      selectedManageCaseLocation: new FormControl(selectedFlag3)
    });
    fixture.detectChanges();
    const radioButtons = fixture.debugElement.nativeElement.querySelectorAll('.govuk-radios__input') as HTMLInputElement[];
    // Clicking first radio button with status "Requested" makes entering status reason optional
    radioButtons[0].click();
    const textarea = fixture.debugElement.nativeElement.querySelector(`#${CaseFlagFormFields.STATUS_CHANGE_REASON}`);
    textarea.value = textareaInput;
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages.length).toBe(0);
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
    // Clicking fourth radio button with status "Not approved" makes entering status reason mandatory
    radioButtons[3].click();
    textarea.value = textareaInput;
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages.length).toBe(0);
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should display correct title based on the display mode', () => {
    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE;
    // component.setUpdateCaseFlagTitle(activeFlag);
    expect(component.setUpdateCaseFlagTitle(activeFlag)).toEqual('Update flag "Flag 1"');
    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE_EXTERNAL;
    // component.setUpdateCaseFlagTitle(activeFlag);
    expect(component.setUpdateCaseFlagTitle(activeFlag)).toEqual(CaseFlagWizardStepTitle.UPDATE_FLAG_TITLE_EXTERNAL);
    component.displayContextParameter = '';
    // component.setUpdateCaseFlagTitle(activeFlag);
    expect(component.setUpdateCaseFlagTitle(activeFlag)).toEqual(CaseFlagWizardStepTitle.NONE);
    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE;
    // component.setUpdateCaseFlagTitle(activeFlagWithSubTypeValue);
    expect(component.setUpdateCaseFlagTitle(activeFlagWithSubTypeValue)).toEqual(`${CaseFlagWizardStepTitle.UPDATE_FLAG_TITLE} "Flag 1, Sub Type"`);
    const flag = {} as FlagDetail;
    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE;
    // component.setUpdateCaseFlagTitle(flag);
    expect(component.setUpdateCaseFlagTitle(flag)).toEqual(CaseFlagWizardStepTitle.UPDATE_FLAG_TITLE);
  });

  it('should display only comments text area for manage support', () => {
    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE_EXTERNAL;
    fixture.detectChanges();
    const commentsTextarea = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS}`)).nativeElement;
    expect(commentsTextarea).toBeDefined();
    const statusChangeReasontextarea = fixture.debugElement.nativeElement.querySelector(`#${CaseFlagFormFields.STATUS_CHANGE_REASON}`);
    expect(statusChangeReasontextarea).toBeNull();
    const radioButtons = fixture.debugElement.nativeElement.querySelector('#flag-status-container');
    expect(radioButtons).toBeNull();
    const checkboxWelshTranslation = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.IS_WELSH_TRANSLATION_NEEDED}`));
    expect(checkboxWelshTranslation).toBeNull();
  });
});
