import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { JudicialUserModel } from '../../../domain/jurisdiction';
import { CaseFlagRefdataService, FormValidatorsService, JurisdictionService, SessionStorageService } from '../../../services';
import { WriteComplexFieldComponent } from '../complex/write-complex-field.component';
import { IsCompoundPipe } from '../utils/is-compound.pipe';

@Component({
  selector: 'ccd-write-judicial-user-field',
  styleUrls: ['./write-judicial-user-field.component.scss'],
  templateUrl: './write-judicial-user-field.component.html'
})
export class WriteJudicialUserFieldComponent extends WriteComplexFieldComponent implements OnInit {

  public readonly minSearchCharacters = 2;

  public judicialUserControl: AbstractControl;
  public jurisdiction: string;
  public caseType: string;
  public showAutocomplete = false;
  public filteredJudicialUsers$: Observable<JudicialUserModel[]>;
  public searchTerm = '';
  public noResults = false;

  constructor(private readonly jurisdictionService: JurisdictionService,
              private readonly sessionStorageService: SessionStorageService,
              private readonly caseFlagRefDataService: CaseFlagRefdataService,
              private readonly compoundPipe: IsCompoundPipe,
              private readonly validatorsService: FormValidatorsService) {
    super(compoundPipe, validatorsService);
  }

  public ngOnInit(): void {
    super.ngOnInit();
    // This FormControl is intentionally not bound to the FormGroup because it is used only for selection and display
    // of a JudicialUser value; once selected, the JudicialUser idamId and personalCode properties are set as values
    // on the FormControls of those names, which have been created accordingly for this Complex field type
    this.judicialUserControl = new FormControl(this.caseField.value);

    this.setJurisdictionAndCaseType();

    this.filteredJudicialUsers$ = this.judicialUserControl.valueChanges.pipe(
      tap(() => this.showAutocomplete = false),
      debounceTime(300),
      // Need to check type of input because it changes to object (i.e. JudicialUser) when a value is selected from the
      // autocomplete panel, instead of string when a value is being typed in
      map(input => typeof input === 'string' ? input : input.fullName),
      tap(searchTerm => this.searchTerm = searchTerm),
      filter((searchTerm: string) => searchTerm && searchTerm.length > this.minSearchCharacters),
      switchMap((searchTerm: string) => this.filterJudicialUsers(searchTerm).pipe(
        tap((judicialUsers) => {
          this.showAutocomplete = true;
          this.noResults = judicialUsers.length === 0;
        }),
        catchError(() => this.filteredJudicialUsers$ = of([]))
      ))
    );

    if (this.caseField.value?.personalCode) {
      this.loadJudicialUser(this.caseField.value.personalCode);
    }
  }

  public filterJudicialUsers(searchTerm: string): Observable<JudicialUserModel[]> {
    return this.caseFlagRefDataService.getHmctsServiceDetailsByCaseType(this.caseType).pipe(
      // If an error occurs retrieving HMCTS service details by case type ID, try by service name instead
      catchError(_ => this.caseFlagRefDataService.getHmctsServiceDetailsByServiceName(this.jurisdiction)),
      // Use switchMap to return an inner Observable of the judicial users data, having received the service details
      // including service_code. This avoids having nested `subscribe`s, which is an anti-pattern!
      switchMap(serviceDetails => this.jurisdictionService.searchJudicialUsers(searchTerm, serviceDetails[0].service_code))
    );
  }

  public loadJudicialUser(personalCode: string): void {
    if (personalCode) {
      this.jurisdictionService.searchJudicialUsersByPersonalCodes([personalCode]).pipe(take(1)).subscribe(judicialUsers => {
        this.judicialUserControl.setValue(judicialUsers[0]);
      });
    }
  }

  public setJurisdictionAndCaseType(): void {
    const caseInfoStr = this.sessionStorageService.getItem('caseInfo');
    if (caseInfoStr) {
      const caseInfo = JSON.parse(caseInfoStr);
      this.jurisdiction = caseInfo?.jurisdiction;
      this.caseType = caseInfo?.caseType;
    }
  }

  public displayJudicialUser(judicialUser?: JudicialUserModel): string | undefined {
    return judicialUser ? judicialUser.fullName : undefined;
  }

  public onSelectionChange(event: any): void {
    // The event.source.value property is a JudicialUserModel object instance; use this to update both the caseField
    // value and the values of the two FormControls for the idamId and personalCode properties of the JudicialUser
    // complex field type (these values will appear in the data payload for validation and submission)
    this.caseField.value = {
      idamId: event.source.value.idamId,
      personalCode: event.source.value.personalCode
    };
    this.complexGroup.get('idamId')?.setValue(this.caseField.value.idamId);
    this.complexGroup.get('personalCode')?.setValue(this.caseField.value.personalCode);
  }
}
