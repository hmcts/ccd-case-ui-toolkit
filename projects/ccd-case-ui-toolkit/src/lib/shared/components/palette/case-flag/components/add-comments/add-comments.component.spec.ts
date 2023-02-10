import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AddCommentsErrorMessage, CaseFlagFieldState } from '../../enums';
import { AddCommentsComponent } from './add-comments.component';

describe('AddCommentsComponent', () => {
  let component: AddCommentsComponent;
  let fixture: ComponentFixture<AddCommentsComponent>;
  let nextButton: any;
  let textareaInput: string;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ AddCommentsComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCommentsComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});
    nextButton = fixture.debugElement.nativeElement.querySelector('button[type="button"]');
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
    nextButton.click();
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

  it('should not show an error message on clicking "Next" if comments are not mandatory and none have been entered', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    component.optional = true;
    component.ngOnInit();
    nextButton.click();
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
    textarea.value = textareaInput + '0';
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
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
    textarea.value = textareaInput + '0';
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
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
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages.length).toBe(0);
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
    // Change flag comments to optional
    component.optional = true;
    component.ngOnInit();
    textarea.value = textareaInput;
    textarea.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages.length).toBe(0);
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should show the text "(optional)" in the textarea label if comments are optional', () => {
    component.optional = true;
    component.ngOnInit();
    fixture.detectChanges();
    const flagCommentsLabel = fixture.debugElement.nativeElement.querySelector('.govuk-label--l');
    expect(flagCommentsLabel.textContent).toContain('(optional)');
  });

  it('should not show the text "(optional)" in the textarea label if comments are mandatory', () => {
    const flagCommentsLabel = fixture.debugElement.nativeElement.querySelector('.govuk-label--l');
    expect(flagCommentsLabel.textContent).not.toContain('(optional)');
  });
});
