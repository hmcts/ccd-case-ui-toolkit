import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FlagDetail, FlagDetailDisplayWithFormGroupPath } from '../../domain';
import { CaseFlagFieldState, CaseFlagStatus, UpdateFlagErrorMessage } from '../../enums';
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
    path: [{ id: null, value: 'Reasonable adjustment' }],
    hearingRelevant: false,
    flagCode: 'FL1',
    status: 'Active'
  } as FlagDetail;
  const inactiveFlag = {
    name: 'Flag 2',
    flagComment: 'Rose\'s second flag',
    dateTimeCreated: new Date(),
    path: [{ id: null, value: 'Reasonable adjustment' }],
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
    component.selectedFlag = selectedFlag1;
    nextButton = fixture.debugElement.nativeElement.querySelector('.button-primary');
    textarea = fixture.debugElement.nativeElement.querySelector('.govuk-textarea');
    // 200-character text input
    textareaInput = '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' + '5555555555' + '6666666666' +
      '7777777777' + '8888888888' + '9999999999' + '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' +
      '5555555555' + '6666666666' + '7777777777' + '8888888888' + '9999999999';
    fixture.detectChanges();
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
      fieldId: component.updateFlagControlName
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
      fieldId: component.updateFlagControlName
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

  it('should render the "Active" flag status correctly', () => {
    const statusElement = fixture.debugElement.nativeElement.querySelector('.govuk-tag');
    expect(statusElement.getAttribute('class')).not.toContain('govuk-tag--grey');
  });

  it('should render the "Inactive" flag status correctly', () => {
    component.selectedFlag = selectedFlag2;
    fixture.detectChanges();
    const statusElement = fixture.debugElement.nativeElement.querySelector('.govuk-tag');
    expect(statusElement.getAttribute('class')).toContain('govuk-tag--grey');
  });

  it('should update the flag comments and status', () => {
    spyOn(component, 'onChangeStatus').and.callThrough();
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    // Edit existing flag comments
    textarea.value = 'Edited comment';
    textarea.dispatchEvent(new Event('input'));
    // Click the "Make inactive" button to change the flag status
    fixture.debugElement.nativeElement.querySelector('.button-secondary').click();
    nextButton.click();
    fixture.detectChanges();
    expect(component.onChangeStatus).toHaveBeenCalled();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE,
      errorMessages: component.errorMessages,
      selectedFlag: component.selectedFlag
    });
    expect(component.selectedFlag.flagDetailDisplay.flagDetail.flagComment).toEqual(textarea.value);
    expect(component.selectedFlag.flagDetailDisplay.flagDetail.status).toEqual(CaseFlagStatus.INACTIVE);
  });

  it('should not change an inactive flag status to active', () => {
    component.selectedFlag = selectedFlag2;
    component.onChangeStatus();
    expect(component.selectedFlag.flagDetailDisplay.flagDetail.status).toEqual(CaseFlagStatus.INACTIVE);
  });
});
