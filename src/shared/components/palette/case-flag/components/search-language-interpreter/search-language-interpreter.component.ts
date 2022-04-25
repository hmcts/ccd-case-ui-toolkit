import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, Language } from '../../domain';
import { CaseFlagFieldState, CaseFlagWizardStepTitle, SearchLanguageInterpreterStep } from '../../enums';

@Component({
  selector: 'ccd-search-language-interpreter',
  templateUrl: './search-language-interpreter.component.html',
  styleUrls: ['./search-language-interpreter.component.scss']
})
export class SearchLanguageInterpreterComponent implements OnInit {

  @Input()
  public formGroup: FormGroup;

  @Input()
  public languages: Language[];

  @Output()
  public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public readonly minSearchCharacters = 3;
  public readonly languageSearchTermControlName = 'languageSearchTerm';
  public readonly manualLanguageEntryControlName = 'manualLanguageEntry';
  public filteredLanguages$: Observable<Language[]>;
  public searchTerm = '';
  public isCheckboxEnabled = false;
  public errorMessages: ErrorMessage[];
  public noResults = false;

  public get caseFlagWizardStepTitle(): typeof CaseFlagWizardStepTitle {
    return CaseFlagWizardStepTitle;
  }

  public get searchLanguageInterpreterStep(): typeof SearchLanguageInterpreterStep {
    return SearchLanguageInterpreterStep;
  }

  public ngOnInit(): void {
    this.formGroup.addControl(this.languageSearchTermControlName, new FormControl());
    this.formGroup.addControl(this.manualLanguageEntryControlName, new FormControl());
    this.filteredLanguages$ = this.formGroup.get(this.languageSearchTermControlName).valueChanges.pipe(
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
    // Validate form
    this.validateForm();
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LANGUAGE_INTERPRETER,
      errorMessages: this.errorMessages
    });
  }

  public onEnterLanguageManually(event: Event): void {
    this.isCheckboxEnabled = (event.target as HTMLInputElement).checked;
  }

  public displayLanguage(language?: Language): string | undefined {
    return language ? language.value : undefined;
  }

  private validateForm(): boolean {
    this.errorMessages = [];
    return true;
  }

  private filterLanguages(searchTerm: string): Language[] {
    if (searchTerm.length < this.minSearchCharacters) {
      return [];
    }

    return this.languages.filter(language => language.value.toLowerCase().includes(searchTerm.toLowerCase(), 0));
  }
}
