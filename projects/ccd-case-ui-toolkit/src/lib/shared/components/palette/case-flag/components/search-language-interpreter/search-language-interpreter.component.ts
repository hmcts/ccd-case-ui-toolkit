import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RpxTranslationService } from 'rpx-xui-translation';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ErrorMessage } from '../../../../../domain';
import { FlagType } from '../../../../../domain/case-flag';
import { CaseFlagState, Language } from '../../domain';
import { CaseFlagFieldState, SearchLanguageInterpreterErrorMessage, SearchLanguageInterpreterStep } from '../../enums';
import { SearchLanguageInterpreterControlNames } from './search-language-interpreter-control-names.enum';

@Component({
  selector: 'ccd-search-language-interpreter',
  templateUrl: './search-language-interpreter.component.html',
  styleUrls: ['./search-language-interpreter.component.scss']
})
export class SearchLanguageInterpreterComponent implements OnInit {
  public get searchLanguageInterpreterStep(): typeof SearchLanguageInterpreterStep {
    return SearchLanguageInterpreterStep;
  }
  public readonly SearchLanguageInterpreterControlNames = SearchLanguageInterpreterControlNames;

  @Input()
  public formGroup: FormGroup;

  @Input()
  public flagType: FlagType;

  @Output()
  public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public readonly minSearchCharacters = 3;
  public filteredLanguages$: Observable<Language[]>;
  public searchTerm = '';
  public isCheckboxEnabled = false;
  public searchLanguageInterpreterHint: SearchLanguageInterpreterStep;
  public errorMessages: ErrorMessage[] = [];
  public languageNotSelectedErrorMessage = '';
  public languageNotEnteredErrorMessage = '';
  public languageCharLimitErrorMessage = '';
  public languageEnteredInBothFieldsErrorMessage = '';
  public noResults = false;
  private readonly languageMaxCharLimit = 80;
  private readonly signLanguageFlagCode = 'RA0042';

  constructor(private readonly rpxTranslationService: RpxTranslationService) { }

  public ngOnInit(): void {
    this.searchLanguageInterpreterHint = this.flagType.flagCode === this.signLanguageFlagCode
      ? SearchLanguageInterpreterStep.SIGN_HINT_TEXT
      : SearchLanguageInterpreterStep.HINT_TEXT;
    this.formGroup.addControl(SearchLanguageInterpreterControlNames.LANGUAGE_SEARCH_TERM, new FormControl());
    this.formGroup.addControl(SearchLanguageInterpreterControlNames.MANUAL_LANGUAGE_ENTRY, new FormControl());
    this.filteredLanguages$ = this.formGroup.get(SearchLanguageInterpreterControlNames.LANGUAGE_SEARCH_TERM).valueChanges.pipe(
      // Need to check type of input because it changes to object (i.e. Language) when a value is selected from the
      // autocomplete panel, instead of string when a value is being typed in
      map(input => typeof input === 'string' ? input : input.value),
      map(searchTerm => {
        // Update the current search term
        this.searchTerm = searchTerm;
        return this.filterLanguages(searchTerm);
      }),
      tap(languages => this.noResults = languages.length === 0)
    );
  }

  public onNext(): void {
    // Validate language interpreter entry
    this.validateLanguageEntry();
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LANGUAGE_INTERPRETER,
      errorMessages: this.errorMessages
    });
  }

  public onEnterLanguageManually(event: Event): void {
    this.isCheckboxEnabled = (event.target as HTMLInputElement).checked;

    // If the checkbox is disabled, i.e. unchecked, then clear the manual language entry FormControl of any value to
    // prevent it being retained even when the field itself is hidden
    if (!this.isCheckboxEnabled) {
      this.formGroup.get(SearchLanguageInterpreterControlNames.MANUAL_LANGUAGE_ENTRY).setValue(null);
    }
  }

  public displayLanguage(language?: Language): string | undefined {
    return language ? language.value : undefined;
  }

  private validateLanguageEntry(): void {
    this.languageNotSelectedErrorMessage = null;
    this.languageNotEnteredErrorMessage = null;
    this.languageCharLimitErrorMessage = null;
    this.languageEnteredInBothFieldsErrorMessage = null;
    this.errorMessages = [];
    // Checkbox not enabled means the user has opted to search for and select the language
    if (!this.isCheckboxEnabled && !this.formGroup.get(SearchLanguageInterpreterControlNames.LANGUAGE_SEARCH_TERM).value) {
      this.languageNotSelectedErrorMessage = SearchLanguageInterpreterErrorMessage.LANGUAGE_NOT_ENTERED;
      this.errorMessages.push({
        title: '',
        description: SearchLanguageInterpreterErrorMessage.LANGUAGE_NOT_ENTERED,
        fieldId: SearchLanguageInterpreterControlNames.LANGUAGE_SEARCH_TERM
      });
    }
    // Checkbox enabled means the user has opted to enter the language manually
    if (this.isCheckboxEnabled) {
      if (!this.formGroup.get(SearchLanguageInterpreterControlNames.MANUAL_LANGUAGE_ENTRY).value) {
        this.languageNotEnteredErrorMessage = SearchLanguageInterpreterErrorMessage.LANGUAGE_NOT_ENTERED;
        this.errorMessages.push({
          title: '',
          description: SearchLanguageInterpreterErrorMessage.LANGUAGE_NOT_ENTERED,
          fieldId: SearchLanguageInterpreterControlNames.MANUAL_LANGUAGE_ENTRY
        });
      } else if (this.formGroup.get(SearchLanguageInterpreterControlNames.MANUAL_LANGUAGE_ENTRY).value.length > this.languageMaxCharLimit) {
        this.languageCharLimitErrorMessage = SearchLanguageInterpreterErrorMessage.LANGUAGE_CHAR_LIMIT_EXCEEDED;
        this.errorMessages.push({
          title: '',
          description: SearchLanguageInterpreterErrorMessage.LANGUAGE_CHAR_LIMIT_EXCEEDED,
          fieldId: SearchLanguageInterpreterControlNames.MANUAL_LANGUAGE_ENTRY
        });
      } else if (this.formGroup.get(SearchLanguageInterpreterControlNames.LANGUAGE_SEARCH_TERM).value) {
        // Language entry is permitted in only one field at a time
        this.languageEnteredInBothFieldsErrorMessage = SearchLanguageInterpreterErrorMessage.LANGUAGE_ENTERED_IN_BOTH_FIELDS;
        this.errorMessages.push({
          title: '',
          description: SearchLanguageInterpreterErrorMessage.LANGUAGE_ENTERED_IN_BOTH_FIELDS,
          fieldId: SearchLanguageInterpreterControlNames.LANGUAGE_SEARCH_TERM
        });
      }
    }
  }

  private filterLanguages(searchTerm: string): Language[] {
    if (searchTerm.length < this.minSearchCharacters) {
      return [];
    }

    return this.flagType.listOfValues
      ? this.flagType.listOfValues.filter(language =>
        // If a language has both English and Welsh values, match only on the value appropriate for the page language,
        // i.e. if RpxTranslationService.language is 'cy' then match on the value_cy property only. This is to prevent
        // cross-matches, where a user enters a search term in English and sees the corresponding Welsh value (because
        // the page language is Welsh) and vice versa
        this.rpxTranslationService.language === 'cy' && language.value && language.value_cy &&
        language.value_cy.toLowerCase().includes(searchTerm.toLowerCase(), 0) ||
        this.rpxTranslationService.language !== 'cy' && language.value && language.value_cy &&
        language.value.toLowerCase().includes(searchTerm.toLowerCase(), 0) ||
        !language.value_cy && language.value.toLowerCase().includes(searchTerm.toLowerCase(), 0) ||
        !language.value && language.value_cy.toLowerCase().includes(searchTerm.toLowerCase(), 0))
      : [];
  }
}
