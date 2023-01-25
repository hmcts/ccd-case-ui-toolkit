import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { EnumDisplayDescriptionPipe } from '../../../../../pipes/generic/enum-display-description/enum-display-description.pipe';
import { FlagDetail, FlagDetailDisplayWithFormGroupPath } from '../../domain';
import { CaseFlagFieldState, CaseFlagStatus, UpdateFlagErrorMessage } from '../../enums';
import { UpdateFlagStatesEnum } from '../../enums/update-flag-states.enum';
import { UpdateFlagComponent } from './update-flag.component';

describe('UpdateFlagComponent', () => {
  let component: UpdateFlagComponent;
  let fixture: ComponentFixture<UpdateFlagComponent>;
  let nextButton: any;
  let textarea: any;
  let textareaInput: string;
  const activeFlag = {
    name: 'Flag 1',
    flagComment: 'First flag',
    dateTimeCreated: new Date(),
    path: [{id: null, value: 'Reasonable adjustment'}],
    hearingRelevant: false,
    flagCode: 'FL1',
    status: 'Active'
  } as FlagDetail;
  const inactiveFlag = {
    name: 'Flag 2',
    flagComment: 'Rose\'s second flag',
    dateTimeCreated: new Date(),
    path: [{id: null, value: 'Reasonable adjustment'}],
    hearingRelevant: false,
    flagCode: 'FL2',
    status: 'Inactive'
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [UpdateFlagComponent, EnumDisplayDescriptionPipe]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateFlagComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});
    component.selectedFlag = selectedFlag1;
    // 200-character text input
    textareaInput = '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' + '5555555555' + '6666666666' +
      '7777777777' + '8888888888' + '9999999999' + '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' +
      '5555555555' + '6666666666' + '7777777777' + '8888888888' + '9999999999';
    fixture.detectChanges();

    nextButton = fixture.debugElement.query(By.css('#updateFlagNextButton')).nativeElement;
    textarea = fixture.debugElement.query(By.css(`#${component.FLAG_COMMENTS_CONTROL_NAME}`)).nativeElement;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the flag comments textarea with existing comments', () => {
    // Check the textarea value property, rather than textContent, because this input element has no child nodes
    expect(textarea.value).toEqual(activeFlag.flagComment);
  });

  it('should show an error message on clicking "Next" if comments are mandatory but none have been entered', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    // Delete existing flag comments
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
      fieldId: component.FLAG_COMMENTS_CONTROL_NAME
    });
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED);
  });

  it('should show an error message on clicking "Next" if comments exceed a 200-character limit', () => {
    textarea.value = textareaInput + '0';
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED,
      fieldId: component.FLAG_COMMENTS_CONTROL_NAME
    });
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED);
  });

  it('should not show an error message on clicking "Next" if comments equal a 200-character limit', () => {
    textarea.value = textareaInput;
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages.length).toBe(0);
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should render flag status checkboxes correctly', () => {
    const statusCheckboxLabelsElements = fixture.debugElement.nativeElement.querySelectorAll(`#${component.FLAG_STATUS_CONTROL_NAME} label`);

    const displayedStatuses = [] as string[];
    for (const element of statusCheckboxLabelsElements.values()) {
      displayedStatuses.push(element.textContent.trim());
    }

    expect(displayedStatuses).toEqual(Object.values(CaseFlagStatus));
  });

  it('should start with currentFormStep as FLAG_FORM', () => {
    expect(component.currentFormStep === UpdateFlagStatesEnum.FLAG_FORM);
  });

  it('should set currentFormStep to WELSH_TRANSLATION_FORM when clicking onNext() if welsh checkbox is selected', () => {
    component.formGroup.get(component.FLAG_WELSH_TRANSLATION_CONTROL_NAME).setValue(true);
    fixture.detectChanges();
    component.onNext();

    expect(component.currentFormStep === UpdateFlagStatesEnum.WELSH_TRANSLATION_FORM).toBe(true);
  });

  it('should set currentForm back to FLAG_FORM if it`s WELSH_TRANSLATION_FORM', () => {
    component.currentFormStep = UpdateFlagStatesEnum.WELSH_TRANSLATION_FORM as UpdateFlagStatesEnum;
    fixture.detectChanges();
    component.onBack();

    expect(component.currentFormStep === UpdateFlagStatesEnum.FLAG_FORM).toBe(true);
  });
});
