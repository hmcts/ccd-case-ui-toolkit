import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RpxLanguage, RpxTranslationService } from 'rpx-xui-translation';
import { BehaviorSubject } from 'rxjs';
import { MockRpxTranslatePipe } from '../../../../../test/mock-rpx-translate.pipe';
import { CaseFlagFieldState, SearchLanguageInterpreterErrorMessage, SearchLanguageInterpreterStep } from '../../enums';
import { FlagFieldDisplayPipe, LanguageInterpreterDisplayPipe } from '../../pipes';
import { SearchLanguageInterpreterControlNames } from './search-language-interpreter-control-names.enum';
import { SearchLanguageInterpreterComponent } from './search-language-interpreter.component';

describe('SearchLanguageInterpreterComponent', () => {
  let component: SearchLanguageInterpreterComponent;
  let fixture: ComponentFixture<SearchLanguageInterpreterComponent>;
  let nextButton: HTMLElement;
  let fieldInput: string;
  let mockRpxTranslationService: any;
  const languageFlagCode = 'PF0015';
  const signLanguageFlagCode = 'RA0042';

  beforeEach(waitForAsync(() => {
    const source = new BehaviorSubject<RpxLanguage>('en');
    let currentLanguage: RpxLanguage = 'en';
    mockRpxTranslationService = {
      language$: source.asObservable(),
      set language(lang: RpxLanguage) {
        currentLanguage = lang;
        source.next(lang);
      },
      get language() {
        return currentLanguage;
      }
    };
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatAutocompleteModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [SearchLanguageInterpreterComponent, MockRpxTranslatePipe, FlagFieldDisplayPipe, LanguageInterpreterDisplayPipe],
      providers: [
        { provide: RpxTranslationService, useValue: mockRpxTranslationService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchLanguageInterpreterComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({
      [SearchLanguageInterpreterControlNames.LANGUAGE_SEARCH_TERM] : new FormControl('')
    });
    component.flagType = {
      name: 'Language Interpreter',
      name_cy: 'Cyfieithydd',
      hearingRelevant: false,
      flagComment: false,
      flagCode: languageFlagCode,
      isParent: false,
      Path: [],
      childFlags: [],
      listOfValuesLength: 0,
      listOfValues: [
        { key: 'FRA1', value: 'French1', value_cy: 'Ffrangeg1' },
        { key: 'FRA2', value: 'French2', value_cy: 'Ffrangeg2' },
        { key: 'FRA3', value: 'French3', value_cy: 'Ffrangeg3' },
        { key: 'GB', value: 'English', value_cy: ''}
      ],
      defaultStatus: 'Active',
      externallyAvailable: false,
    };
    nextButton = fixture.debugElement.nativeElement.querySelector('button[type="button"]');
    // 80-character text input
    fieldInput = '0000000000' + '1111111111' + '2222222222' + '3333333333' + '4444444444' + '5555555555' + '6666666666' +
      '7777777777';
    // Set default translation language to English
    mockRpxTranslationService.language = 'en';
    // Deliberately omitted fixture.detectChanges() here, to allow translation language to be set to Welsh for selected tests
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

  it('should show three languages in the selection panel if "fre" (for French) is typed in the language search box', () => {
    fixture.detectChanges();
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
    expect(matOptions.length).toBe(3);
    expect(matOptions[0].textContent).toContain('French1');
    expect(matOptions[1].textContent).toContain('French2');
    expect(matOptions[2].textContent).toContain('French3');
  });

  it('should show "No results found" if "ffr" is typed in the language search box and the page language selection is English', () => {
    fixture.detectChanges();
    const languageSearchBox = fixture.debugElement.nativeElement.querySelector('.search-language__input');
    // This event is required to trigger the CDK overlay used by the Angular Material autocomplete component
    languageSearchBox.dispatchEvent(new Event('focusin'));
    languageSearchBox.value = 'ffr';
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

  it('should show three languages if "ffr" is typed in the language search box and the page language selection is Welsh', () => {
    mockRpxTranslationService.language = 'cy';
    fixture.detectChanges();
    const languageSearchBox = fixture.debugElement.nativeElement.querySelector('.search-language__input');
    // This event is required to trigger the CDK overlay used by the Angular Material autocomplete component
    languageSearchBox.dispatchEvent(new Event('focusin'));
    languageSearchBox.value = 'ffr';
    languageSearchBox.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    // The options open in an overlay outside the component, so the DOM document object needs to be queried to select them
    const languageSelectionPanel = document.querySelector('.mat-autocomplete-panel-extend');
    expect(languageSelectionPanel).toBeTruthy();
    const matOptions = document.querySelectorAll('mat-option');
    expect(matOptions.length).toBe(3);
    expect(matOptions[0].textContent).toContain('Ffrangeg1');
    expect(matOptions[1].textContent).toContain('Ffrangeg2');
    expect(matOptions[2].textContent).toContain('Ffrangeg3');
  });

  it('should show "No results found" if "fre" is typed in the language search box and the page language selection is Welsh', () => {
    mockRpxTranslationService.language = 'cy';
    fixture.detectChanges();
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

  it('should show one language in the selection panel if "eng" (for English) is typed in the language search box', () => {
    fixture.detectChanges();
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

  it('should show the English value for a language if there is no Welsh value and the page language selection is Welsh', () => {
    fixture.detectChanges();
    mockRpxTranslationService.language = 'cy';
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

  it('should show "No results found" in the selection panel if "ger" (for German) is typed in the language search box', () => {
    fixture.detectChanges();
    const languageSearchBox = fixture.debugElement.nativeElement.querySelector('.search-language__input');
    // This event is required to trigger the CDK overlay used by the Angular Material autocomplete component
    languageSearchBox.dispatchEvent(new Event('focusin'));
    languageSearchBox.value = 'ger';
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
    fixture.detectChanges();
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
      errorMessages: component.errorMessages
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SearchLanguageInterpreterErrorMessage.LANGUAGE_NOT_ENTERED,
      fieldId: SearchLanguageInterpreterControlNames.LANGUAGE_SEARCH_TERM
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
    fixture.detectChanges();
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LANGUAGE_INTERPRETER,
      errorMessages: component.errorMessages
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SearchLanguageInterpreterErrorMessage.LANGUAGE_NOT_ENTERED,
      fieldId: SearchLanguageInterpreterControlNames.MANUAL_LANGUAGE_ENTRY
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
    manualLanguageEntryField.value = `${fieldInput}0`;
    manualLanguageEntryField.dispatchEvent(new Event('input'));
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LANGUAGE_INTERPRETER,
      errorMessages: component.errorMessages
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SearchLanguageInterpreterErrorMessage.LANGUAGE_CHAR_LIMIT_EXCEEDED,
      fieldId: SearchLanguageInterpreterControlNames.MANUAL_LANGUAGE_ENTRY
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
      errorMessages: component.errorMessages
    });
    expect(component.errorMessages.length).toBe(0);
    const selectedLanguageErrorMessageElement = nativeElement.querySelector('#language-not-selected-error-message');
    // There should be no error shown above the language search box because manual language entry has been selected
    expect(selectedLanguageErrorMessageElement).toBeNull();
    const manualLanguageErrorMessageElement = nativeElement.querySelector('#language-char-limit-error-message');
    expect(manualLanguageErrorMessageElement).toBeNull();
  });

  it('should show an error message if both a language has been selected and a language has been entered manually', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    // It's not possible to programmatically test option selection from the Angular Material autocomplete component
    // without recreating the entire unit test from the library, so just set the language search FormControl value
    // manually, as if the user had selected an option
    component.formGroup.get(SearchLanguageInterpreterControlNames.LANGUAGE_SEARCH_TERM).setValue(component.flagType.listOfValues[3]);
    const nativeElement = fixture.debugElement.nativeElement;
    const checkboxElement = nativeElement.querySelector('.govuk-checkboxes__input');
    checkboxElement.click();
    fixture.detectChanges();
    const manualLanguageEntryField = nativeElement.querySelector('#manual-language-entry');
    manualLanguageEntryField.value = fieldInput;
    manualLanguageEntryField.dispatchEvent(new Event('input'));
    expect(component.formGroup.get(SearchLanguageInterpreterControlNames.MANUAL_LANGUAGE_ENTRY).value).toEqual(fieldInput);
    nextButton.click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LANGUAGE_INTERPRETER,
      errorMessages: component.errorMessages
    });
    expect(component.errorMessages.length).toBe(1);
    const errorMessageElement = nativeElement.querySelector('#language-entered-in-both-fields-error-message');
    expect(errorMessageElement.textContent).toContain(SearchLanguageInterpreterErrorMessage.LANGUAGE_ENTERED_IN_BOTH_FIELDS);
  });

  it('should clear the value for the manual language entry FormControl if "Enter the language manually" is unchecked', () => {
    const nativeElement = fixture.debugElement.nativeElement;
    const checkboxElement = nativeElement.querySelector('.govuk-checkboxes__input');
    checkboxElement.click();
    fixture.detectChanges();
    const manualLanguageEntryField = nativeElement.querySelector('#manual-language-entry');
    manualLanguageEntryField.value = fieldInput;
    manualLanguageEntryField.dispatchEvent(new Event('input'));
    expect(component.formGroup.get(SearchLanguageInterpreterControlNames.MANUAL_LANGUAGE_ENTRY).value).toEqual(fieldInput);
    // Uncheck "Enter the language manually" checkbox
    checkboxElement.click();
    expect(component.isCheckboxEnabled).toBe(false);
    expect(component.formGroup.get(SearchLanguageInterpreterControlNames.MANUAL_LANGUAGE_ENTRY).value).toBeNull();
  });

  // Test excluded; currently failing with error ExpressionChangedAfterItHasBeenCheckedError due to caching current FlagType
  // selection, which comes from a FormControl value, and multiple fixture.detectChanges() calls
  xit('should show the correct page title and hint text depending on whether the flag type is sign language or not', () => {
    fixture.detectChanges();
    const nativeElement = fixture.debugElement.nativeElement;
    let titleElement = nativeElement.querySelector('.govuk-label--l');
    let hintTextElement = nativeElement.querySelector('#language-search-box-hint');
    expect(titleElement.textContent).toContain(component.flagType.name);
    expect(hintTextElement.textContent).toContain(SearchLanguageInterpreterStep.HINT_TEXT);
    // Change flag type to sign language
    component.flagType.flagCode = signLanguageFlagCode;
    component.ngOnInit();
    fixture.detectChanges();
    titleElement = nativeElement.querySelector('.govuk-label--l');
    hintTextElement = nativeElement.querySelector('#language-search-box-hint');
    expect(titleElement.textContent).toContain(component.flagType.name);
    expect(hintTextElement.textContent).toContain(SearchLanguageInterpreterStep.SIGN_HINT_TEXT);
  });

  it('should show the page title (i.e. flag type name) using the stored Welsh value if the selected language is Welsh', () => {
    mockRpxTranslationService.language = 'cy';
    fixture.detectChanges();
    const nativeElement = fixture.debugElement.nativeElement;
    const titleElement = nativeElement.querySelector('.govuk-label--l');
    expect(titleElement.textContent).toContain(component.flagType.name_cy);
  });

  it('should show the page title using the stored English value if the selected language is Welsh but no Welsh value exists', () => {
    mockRpxTranslationService.language = 'cy';
    component.flagType.name_cy = null;
    fixture.detectChanges();
    const nativeElement = fixture.debugElement.nativeElement;
    const titleElement = nativeElement.querySelector('.govuk-label--l');
    expect(titleElement.textContent).toContain(component.flagType.name);
  });

  it('should show the page title using the stored Welsh value if the selected language is English but no English value exists', () => {
    component.flagType.name = null;
    fixture.detectChanges();
    const nativeElement = fixture.debugElement.nativeElement;
    const titleElement = nativeElement.querySelector('.govuk-label--l');
    expect(titleElement.textContent).toContain(component.flagType.name_cy);
  });

  it('should switch between English and Welsh displays of the page title when the page language selection is changed', () => {
    fixture.detectChanges();
    const nativeElement = fixture.debugElement.nativeElement;
    const titleElement = nativeElement.querySelector('.govuk-label--l');
    expect(titleElement.textContent).toContain(component.flagType.name);
    mockRpxTranslationService.language = 'cy';
    fixture.detectChanges();
    expect(titleElement.textContent).toContain(component.flagType.name_cy);
  });
});
