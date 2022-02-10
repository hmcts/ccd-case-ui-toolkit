import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Language } from "../../domain";

@Component({
  selector: 'ccd-search-language-interpreter',
  templateUrl: './search-language-interpreter.component.html',
  styleUrls: ['./search-language-interpreter.component.scss']
})
export class SearchLanguageInterpreterComponent implements OnInit {

  @Input() public delay?: number = 500;
  @Input() public form: FormGroup;
  public readonly minSearchCharacters = 3;
  public languages: Language[];
  public filteredLanguages$: Observable<string[]>;
  public showAutocomplete = false;
  public term: string = '';
  public isCheckboxEnabled = false;

  constructor(private readonly fb: FormBuilder, private readonly cd: ChangeDetectorRef) {
    this.form = this.fb.group({
      searchTerm: ['']
    });
  }

  public ngOnInit(): void {
    this.filteredLanguages$ = this.form.controls.searchTerm.valueChanges.pipe(
      map(value => this.getLanguages(value))
    );
  }
  
  public onEnterLanguageManually(event: any): void {
    this.isCheckboxEnabled = event.target.checked;
  }

  public onSelectionChange(language: Language): void {
    console.log('LANGUAGE', language);
  }

  public getLanguages(value: string): string[] {
    this.languages = [
      {key: 'AL1', value: 'Albanian1'},
      {key: 'AL2', value: 'Albanian2'},
      {key: 'AL3', value: 'Albanian3'},
      {key: 'ES', value: 'Spanish'},
      {key: 'PT', value: 'Portugese'}
    ];
    if (value.length < this.minSearchCharacters) {
      return [];
    }

    return this.languages.filter(x => x.value.toLowerCase().includes(value.toLowerCase(), 0)).map(x => x.value);
  }
}
