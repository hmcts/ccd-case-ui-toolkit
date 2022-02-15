import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, Language } from '../../domain';
import { CaseFlagFieldState, CaseFlagWizardStepTitle } from '../../enums';

@Component({
  selector: 'ccd-search-language-interpreter',
  templateUrl: './search-language-interpreter.component.html',
  styleUrls: ['./search-language-interpreter.component.scss']
})
export class SearchLanguageInterpreterComponent implements OnInit {

  @Input()
  public formGroup: FormGroup;

  @Output()
  public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public readonly minSearchCharacters = 3;
  public languages: Language[];
  public filteredLanguages$: Observable<string[]>;
  public showAutocomplete = false;
  public term = '';
  public isCheckboxEnabled = false;
  public errorMessages: ErrorMessage[];

  public get caseFlagWizardStepTitle(): typeof CaseFlagWizardStepTitle {
    return CaseFlagWizardStepTitle
  };

  public ngOnInit(): void {
    this.formGroup.addControl('searchTerm', new FormControl(''));
    this.filteredLanguages$ = this.formGroup.controls.searchTerm.valueChanges.pipe(
      map(value => this.getLanguages(value))
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

  public onEnterLanguageManually(event: any): void {
    this.isCheckboxEnabled = event.target.checked;
  }

  public onSelectionChange(language: Language): void {
    console.log('LANGUAGE', language);
  }

  private validateForm(): boolean {
    this.errorMessages = [];
    return true;
  }

  private getLanguages(value: string): string[] {
    // TODO: This will be dynamically pulled from the reference data
    this.languages = [
      {key: 'AL1', value: 'Albanian1'},
      {key: 'AL2', value: 'Albanian2'},
      {key: 'AL3', value: 'Albanian3'},
      {key: 'ES', value: 'Spanish'},
      {key: 'PT', value: 'Portugese'},
      {key: 'GB', value: 'English'},
      {key: 'FR', value: 'French'}
    ];
    if (value.length < this.minSearchCharacters) {
      return [];
    }

    return this.languages.filter(x => x.value.toLowerCase().includes(value.toLowerCase(), 0)).map(x => x.value);
  }
}
