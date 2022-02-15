import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material';
import { SearchLanguageInterpreterComponent } from './search-language-interpreter.component';

describe('SearchLanguageInterpreterComponent', () => {
  let component: SearchLanguageInterpreterComponent;
  let fixture: ComponentFixture<SearchLanguageInterpreterComponent>;

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show enter the language text input if enter the langauge manually checkbox is checked', () => {
    const nativeElement = fixture.debugElement.nativeElement;
    const checkboxElement = nativeElement.querySelector('.govuk-checkboxes__input');
    checkboxElement.click();
    fixture.detectChanges();
    expect(nativeElement.querySelector('#language-typed-in')).toBeDefined();
  });

  // TODO: Further tests to be added when this component is properly integrated with the user journery
});
