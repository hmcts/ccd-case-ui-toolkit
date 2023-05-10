import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockRpxTranslatePipe } from '../../../../../../test/mock-rpx-translate.pipe';
import { FlagDetail, FlagDetailDisplayWithFormGroupPath } from '../../../domain';
import { CaseFlagFieldState, CaseFlagFormFields, UpdateFlagAddTranslationErrorMessage } from '../../../enums';
import { UpdateFlagAddTranslationFormComponent } from './update-flag-add-translation-form.component';

describe('UpdateFlagAddTranslationFormComponent', () => {
  let component: UpdateFlagAddTranslationFormComponent;
  let fixture: ComponentFixture<UpdateFlagAddTranslationFormComponent>;
  let otherDescriptionControl: DebugElement;
  let otherDescriptionWelshControl: DebugElement;
  let flagCommentsControl: DebugElement;
  let flagCommentsWelshControl: DebugElement;
  let nextButton: HTMLElement;
  let otherDescriptionTextarea: HTMLInputElement;
  let otherDescriptionWelshTextarea: HTMLInputElement;
  let flagCommentsTextarea: HTMLInputElement;
  let flagCommentsWelshTextarea: HTMLInputElement;
  let textareaInput: string;
  const activeFlag = {
    name: 'Flag 1',
    otherDescription: 'A description',
    otherDescription_cy: 'A description (Welsh)',
    flagComment: 'First flag',
    flagComment_cy: 'First flag (Welsh)',
    dateTimeCreated: new Date(),
    path: [{id: null, value: 'Reasonable adjustment'}],
    hearingRelevant: false,
    flagCode: 'FL1',
    status: 'Active'
  } as FlagDetail;
  const selectedFlag1 = {
    flagDetailDisplay: {
      partyName: 'Rose Bank',
      flagDetail: activeFlag,
    },
    pathToFlagsFormGroup: ''
  } as FlagDetailDisplayWithFormGroupPath;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateFlagAddTranslationFormComponent, MockRpxTranslatePipe],
      imports: [ ReactiveFormsModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateFlagAddTranslationFormComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({
      selectedManageCaseLocation: new FormControl(selectedFlag1)
    });
    component.formGroup.addControl(CaseFlagFormFields.COMMENTS, new FormControl(''));
    // 200-character text input
    textareaInput = '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' + '5555555555' + '6666666666' +
      '7777777777' + '8888888888' + '9999999999' + '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' +
      '5555555555' + '6666666666' + '7777777777' + '8888888888' + '9999999999';
    component.selectedFlag = selectedFlag1;
    nextButton = fixture.debugElement.query(By.css('#updateFlagNextButton')).nativeElement;
    fixture.detectChanges();
    otherDescriptionControl = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.OTHER_FLAG_DESCRIPTION}`));
    otherDescriptionWelshControl = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH}`));
    flagCommentsControl = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS}`));
    flagCommentsWelshControl = fixture.debugElement.query(By.css(`#${CaseFlagFormFields.COMMENTS_WELSH}`));
    otherDescriptionTextarea = otherDescriptionControl.nativeElement;
    otherDescriptionWelshTextarea = otherDescriptionWelshControl.nativeElement;
    flagCommentsTextarea = flagCommentsControl.nativeElement;
    flagCommentsWelshTextarea = flagCommentsWelshControl.nativeElement;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should add three form controls if formGroup exists', () => {
    expect(component.formGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION)).toBeTruthy();
    expect(component.formGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH)).toBeTruthy();
    expect(component.formGroup.get(CaseFlagFormFields.COMMENTS_WELSH)).toBeTruthy();
  });

  it('should pre-populate initial values for the three form controls added, if such values exist in the selected flag', () => {
    expect(component.formGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION).value).toEqual(
      selectedFlag1.flagDetailDisplay.flagDetail.otherDescription);
    expect(component.formGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH).value).toEqual(
      selectedFlag1.flagDetailDisplay.flagDetail.otherDescription_cy);
    expect(component.formGroup.get(CaseFlagFormFields.COMMENTS_WELSH).value).toEqual(
      selectedFlag1.flagDetailDisplay.flagDetail.flagComment_cy);
  });

  it('should have all four textareas based on names', () => {
    expect(otherDescriptionControl?.name).toEqual('textarea');
    expect(otherDescriptionWelshControl?.name).toEqual('textarea');
    expect(flagCommentsControl?.name).toEqual('textarea');
    expect(flagCommentsWelshControl?.name).toEqual('textarea');
  });

  it('should show an error message on clicking "Next" for each textarea input exceeding a 200-character limit', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    otherDescriptionTextarea.value = `${textareaInput}0`;
    otherDescriptionTextarea.dispatchEvent(new Event('input'));
    otherDescriptionWelshTextarea.value = `${textareaInput}0`;
    otherDescriptionWelshTextarea.dispatchEvent(new Event('input'));
    flagCommentsTextarea.value = `${textareaInput}0`;
    flagCommentsTextarea.dispatchEvent(new Event('input'));
    flagCommentsWelshTextarea.value = `${textareaInput}0`;
    flagCommentsWelshTextarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE_WELSH_TRANSLATION,
      errorMessages: component.errorMessages,
      selectedFlag: component.selectedFlag
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: UpdateFlagAddTranslationErrorMessage.DESCRIPTION_CHAR_LIMIT_EXCEEDED,
      fieldId: CaseFlagFormFields.OTHER_FLAG_DESCRIPTION
    });
    expect(component.errorMessages[1]).toEqual({
      title: '',
      description: UpdateFlagAddTranslationErrorMessage.DESCRIPTION_CHAR_LIMIT_EXCEEDED,
      fieldId: CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH
    });
    expect(component.errorMessages[2]).toEqual({
      title: '',
      description: UpdateFlagAddTranslationErrorMessage.COMMENTS_CHAR_LIMIT_EXCEEDED,
      fieldId: CaseFlagFormFields.COMMENTS
    });
    expect(component.errorMessages[3]).toEqual({
      title: '',
      description: UpdateFlagAddTranslationErrorMessage.COMMENTS_CHAR_LIMIT_EXCEEDED,
      fieldId: CaseFlagFormFields.COMMENTS_WELSH
    });
    const errorMessageElements = fixture.debugElement.queryAll(By.css('.govuk-error-message'));
    expect(errorMessageElements[0].nativeElement.textContent).toContain(
      UpdateFlagAddTranslationErrorMessage.DESCRIPTION_CHAR_LIMIT_EXCEEDED);
    expect(errorMessageElements[1].nativeElement.textContent).toContain(
      UpdateFlagAddTranslationErrorMessage.DESCRIPTION_CHAR_LIMIT_EXCEEDED);
    expect(errorMessageElements[2].nativeElement.textContent).toContain(
      UpdateFlagAddTranslationErrorMessage.COMMENTS_CHAR_LIMIT_EXCEEDED);
    expect(errorMessageElements[3].nativeElement.textContent).toContain(
      UpdateFlagAddTranslationErrorMessage.COMMENTS_CHAR_LIMIT_EXCEEDED);
  });

  it('should not show an error message for any textarea input equalling a 200-character limit', () => {
    otherDescriptionTextarea.value = textareaInput;
    otherDescriptionTextarea.dispatchEvent(new Event('input'));
    otherDescriptionWelshTextarea.value = textareaInput;
    otherDescriptionWelshTextarea.dispatchEvent(new Event('input'));
    flagCommentsTextarea.value = textareaInput;
    flagCommentsTextarea.dispatchEvent(new Event('input'));
    flagCommentsWelshTextarea.value = textareaInput;
    flagCommentsWelshTextarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages.length).toBe(0);
    const errorMessageElements = fixture.debugElement.queryAll(By.css('.govuk-error-message'));
    expect(errorMessageElements.length).toBe(0);
  });
});
