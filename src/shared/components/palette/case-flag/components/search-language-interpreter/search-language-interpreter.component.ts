import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, Language } from '../../domain';
import { CaseFlagFieldState } from '../../enums';

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

  constructor(private readonly fb: FormBuilder, private readonly cd: ChangeDetectorRef) {
    this.formGroup = this.fb.group({
      searchTerm: ['']
    });
  }

  public ngOnInit(): void {
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
