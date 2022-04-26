import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material';
import { SearchLanguageInterpreterComponent } from './search-language-interpreter.component';

describe('SearchLanguageInterpreterComponent', () => {
  let component: SearchLanguageInterpreterComponent;
  let fixture: ComponentFixture<SearchLanguageInterpreterComponent>;
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
    const nativeElement = fixture.debugElement.nativeElement;
    const languageSearchBox = nativeElement.querySelector('.search-language__input');
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
    const nativeElement = fixture.debugElement.nativeElement;
    const languageSearchBox = nativeElement.querySelector('.search-language__input');
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
  });

  it('should show "No results found" in the selection panel if "fre" (for French) is typed in the language search box', () => {
    const nativeElement = fixture.debugElement.nativeElement;
    const languageSearchBox = nativeElement.querySelector('.search-language__input');
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
  });

  it('should not show the language selection panel if fewer than three characters are typed in the language search box', () => {
    const nativeElement = fixture.debugElement.nativeElement;
    const languageSearchBox = nativeElement.querySelector('.search-language__input');
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
});
