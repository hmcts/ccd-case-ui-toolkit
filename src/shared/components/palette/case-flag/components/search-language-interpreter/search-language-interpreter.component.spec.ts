import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material';
import { CaseFlagFieldState, SearchLanguageInterpreterErrorMessage } from '../../enums';
import { SearchLanguageInterpreterComponent } from './search-language-interpreter.component';

describe('SearchLanguageInterpreterComponent', () => {
  let component: SearchLanguageInterpreterComponent;
  let fixture: ComponentFixture<SearchLanguageInterpreterComponent>;
  let nextButton: any;
  let fieldInput: string;
  const languages = [
    {key: 'AL1', value: 'Albanian1'},
    {key: 'AL2', value: 'Albanian2'},
    {key: 'AL3', value: 'Albanian3'},
    {key: 'GB', value: 'English'}
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatAutocompleteModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [SearchLanguageInterpreterComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchLanguageInterpreterComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({
      [component.languageSearchTermControlName] : new FormControl('')
    });
    component.languages = languages;
    nextButton = fixture.debugElement.nativeElement.querySelector('button[type="button"]');
    // 80-character text input
    fieldInput = '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' + '5555555555' + '6666666666' +
      '7777777777';
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should show "Enter the language" text input if "Enter the language manually" checkbox is checked', () => {
    const nativeElement = fixture.debugElement.nativeElement;
    const checkboxElement = nativeElement.querySelector('.govuk-checkboxes__input');
    checkboxElement.click();
    fixture.detectChanges();
    expect(nativeElement.querySelector('#manual-language-entry')).toBeTruthy();
  });

  it('should show three languages in the selection panel if "alb" (for Albanian) is typed in the language search box', () => {
    const languageSearchBox = fixture.debugElement.nativeElement.querySelector('.search-language__input');
    // This event is required to trigger the CDK overlay used by the Angular Material autocomplete component
    languageSearchBox.dispatchEvent(new Event('focusin'));
    languageSearchBox.value = 'alb';
    languageSearchBox.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    // The options open in an overlay outside the component, so the DOM document object needs to be queried to select them
    const languageSelectionPanel = document.querySelector('.mat-autocomplete-panel-extend');
    expect(languageSelectionPanel).toBeTruthy();
    const matOptions = document.querySelectorAll('mat-option');
    expect(matOptions.length).toBe(3);
    expect(matOptions[0].textContent).toContain('Albanian1');
    expect(matOptions[1].textContent).toContain('Albanian2');
    expect(matOptions[2].textContent).toContain('Albanian3');
  });

  it('should show one language in the selection panel if "eng" (for English) is typed in the language search box', () => {
    const languageSearchBox = fixture.debugElement.nativeElement.querySelector('.search-language__input');
    // This event is required to trigger the CDK overlay used by the Angular Material autocomplete component
    languageSearchBox.dispatchEvent(new Event('focusin'));
    languageSearchBox.value = 'eng';
    languageSearchBox.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    // The options open in an overlay outside the component, so the DOM document object needs to be queried to select them
    const languageSelectionPanel = document.querySelector('.mat-autocomplete-panel-extend');
    expect(languageSelectionPanel).toBeTruthy();
    const matOptions = document.querySelectorAll('mat-option');
    expect(matOptions.length).toBe(1);
    expect(matOptions[0].textContent).toContain('English');
    // Check that the option is selectable
    expect(matOptions[0].getAttribute('disabled')).toBeNull();
  });

  it('should show "No results found" in the selection panel if "fre" (for French) is typed in the language search box', () => {
    const languageSearchBox = fixture.debugElement.nativeElement.querySelector('.search-language__input');
    // This event is required to trigger the CDK overlay used by the Angular Material autocomplete component
    languageSearchBox.dispatchEvent(new Event('focusin'));
    languageSearchBox.value = 'fre';
    languageSearchBox.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    // The options open in an overlay outside the component, so the DOM document object needs to be queried to select them
    const languageSelectionPanel = document.querySelector('.mat-autocomplete-panel-extend');
    expect(languageSelectionPanel).toBeTruthy();
    const matOptions = document.querySelectorAll('mat-option');
    expect(matOptions.length).toBe(1);
    expect(matOptions[0].textContent).toContain('No results found');
    // Check that the option is *not* selectable, since it is not a proper value
    expect(matOptions[0].getAttribute('disabled')).toEqual('');
  });

  it('should not show the language selection panel if fewer than three characters are typed in the language search box', () => {
    const languageSearchBox = fixture.debugElement.nativeElement.querySelector('.search-language__input');
    // This event is required to trigger the CDK overlay used by the Angular Material autocomplete component
    languageSearchBox.dispatchEvent(new Event('focusin'));
    languageSearchBox.value = 'en';
    languageSearchBox.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    // The options open in an overlay outside the component, so the DOM document object needs to be queried to select them
    const languageSelectionPanel = document.querySelector('.mat-autocomplete-panel-extend');
    // The language selection panel will still be defined but it should be hidden
    expect(languageSelectionPanel).toBeTruthy();
    expect(languageSelectionPanel.getAttribute('class')).toContain('mat-autocomplete-hidden');
    const matOptions = document.querySelectorAll('mat-option');
    expect(matOptions.length).toBe(0);
  });

  it('should show an error message on clicking "Next" if no language has been selected', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LANGUAGE_INTERPRETER,
      errorMessages: component.errorMessages,
      listOfValues: component.languages
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SearchLanguageInterpreterErrorMessage.LANGUAGE_NOT_ENTERED,
      fieldId: component.languageSearchTermControlName
    });
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('#language-not-selected-error-message');
    expect(errorMessageElement.textContent).toContain(SearchLanguageInterpreterErrorMessage.LANGUAGE_NOT_ENTERED);
  });

  it('should show an error message on clicking "Next" if "Enter the language manually" is checked and no language is entered', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    const nativeElement = fixture.debugElement.nativeElement;
    const checkboxElement = nativeElement.querySelector('.govuk-checkboxes__input');
    checkboxElement.click();
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LANGUAGE_INTERPRETER,
      errorMessages: component.errorMessages,
      listOfValues: component.languages
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SearchLanguageInterpreterErrorMessage.LANGUAGE_NOT_ENTERED,
      fieldId: component.manualLanguageEntryControlName
    });
    const selectedLanguageErrorMessageElement = nativeElement.querySelector('#language-not-selected-error-message');
    // There should be no error shown above the language search box because manual language entry has been selected
    expect(selectedLanguageErrorMessageElement).toBeNull();
    const manualLanguageErrorMessageElement = nativeElement.querySelector('#language-not-entered-error-message');
    expect(manualLanguageErrorMessageElement.textContent).toContain(SearchLanguageInterpreterErrorMessage.LANGUAGE_NOT_ENTERED);
  });

  it('should show an error message if "Enter the language manually" is checked and language entry exceeds 80-character limit', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    const nativeElement = fixture.debugElement.nativeElement;
    const checkboxElement = nativeElement.querySelector('.govuk-checkboxes__input');
    checkboxElement.click();
    fixture.detectChanges();
    const manualLanguageEntryField = nativeElement.querySelector('#manual-language-entry');
    manualLanguageEntryField.value = fieldInput + '0';
    manualLanguageEntryField.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LANGUAGE_INTERPRETER,
      errorMessages: component.errorMessages,
      listOfValues: component.languages
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SearchLanguageInterpreterErrorMessage.LANGUAGE_CHAR_LIMIT_EXCEEDED,
      fieldId: component.manualLanguageEntryControlName
    });
    const selectedLanguageErrorMessageElement = nativeElement.querySelector('#language-not-selected-error-message');
    // There should be no error shown above the language search box because manual language entry has been selected
    expect(selectedLanguageErrorMessageElement).toBeNull();
    const manualLanguageErrorMessageElement = nativeElement.querySelector('#language-char-limit-error-message');
    expect(manualLanguageErrorMessageElement.textContent).toContain(SearchLanguageInterpreterErrorMessage.LANGUAGE_CHAR_LIMIT_EXCEEDED);
  });

  it('should not show an error message if "Enter the language manually" is checked and language entry equals 80-character limit', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    const nativeElement = fixture.debugElement.nativeElement;
    const checkboxElement = nativeElement.querySelector('.govuk-checkboxes__input');
    checkboxElement.click();
    fixture.detectChanges();
    const manualLanguageEntryField = nativeElement.querySelector('#manual-language-entry');
    manualLanguageEntryField.value = fieldInput;
    manualLanguageEntryField.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LANGUAGE_INTERPRETER,
      errorMessages: component.errorMessages,
      listOfValues: component.languages
    });
    expect(component.errorMessages.length).toBe(0);
    const selectedLanguageErrorMessageElement = nativeElement.querySelector('#language-not-selected-error-message');
    // There should be no error shown above the language search box because manual language entry has been selected
    expect(selectedLanguageErrorMessageElement).toBeNull();
    const manualLanguageErrorMessageElement = nativeElement.querySelector('#language-char-limit-error-message');
    expect(manualLanguageErrorMessageElement).toBeNull();
  });
});
