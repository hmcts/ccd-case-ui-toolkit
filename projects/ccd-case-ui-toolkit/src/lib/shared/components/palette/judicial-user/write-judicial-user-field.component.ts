import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Constants } from '../../../commons/constants';
import { JudicialUserModel } from '../../../domain/jurisdiction';
import { CaseFlagRefdataService, FieldsUtils, FormValidatorsService, JurisdictionService, SessionStorageService } from '../../../services';
import { WriteComplexFieldComponent } from '../complex/write-complex-field.component';
import { IsCompoundPipe } from '../utils/is-compound.pipe';
import { CaseNotifier } from '../../case-editor/services/case.notifier';

@Component({
  selector: 'ccd-write-judicial-user-field',
  styleUrls: ['./write-judicial-user-field.component.scss'],
  templateUrl: './write-judicial-user-field.component.html'
})
export class WriteJudicialUserFieldComponent extends WriteComplexFieldComponent implements OnInit, OnDestroy {

  public readonly minSearchCharacters = 2;

  public judicialUserControl: AbstractControl;
  public jurisdiction: string;
  public caseType: string;
  public showAutocomplete = false;
  public filteredJudicialUsers$: Observable<JudicialUserModel[]>;
  public searchTerm = '';
  public noResults = false;
  public errors: ValidationErrors;
  public invalidSearchTerm = false;
  public judicialUserSelected = false;
  public jurisdictionSubscription: Subscription;

  constructor(private readonly jurisdictionService: JurisdictionService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly caseFlagRefDataService: CaseFlagRefdataService,
    private readonly compoundPipe: IsCompoundPipe,
    private readonly validatorsService: FormValidatorsService,
    private readonly caseNotifier: CaseNotifier) {
    super(compoundPipe, validatorsService);
    this.caseNotifier.caseView.subscribe((caseDetails) => {
      if (caseDetails) {
        this.jurisdiction = caseDetails?.case_type?.jurisdiction?.id;
        this.caseType = caseDetails?.case_type?.id;
      }
    });
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.judicialUserControl = new FormControl(this.caseField.value);
    // FormControl needs to be added to the main FormGroup so it can be picked up by the PageValidationService when
    // checking if the page is valid. FormGroup.setControl() is used here to ensure any existing JudicialUser
    // FormControl is replaced when the component is re-initialised, for example, if the user navigates away then
    // back to the page containing the JudicialUser field
    this.formGroup.setControl(`${this.caseField.id}_judicialUserControl`, this.judicialUserControl);
    // Ensure that this FormControl has links to the JudicialUser case field and this component
    FieldsUtils.addCaseFieldAndComponentReferences(this.judicialUserControl, this.caseField, this);
    this.setupValidation();

    this.filteredJudicialUsers$ = this.judicialUserControl.valueChanges.pipe(
      tap(() => this.showAutocomplete = false),
      debounceTime(300),
      // Need to check type of input because it changes to object (i.e. JudicialUser) when a value is selected from the
      // autocomplete panel, instead of string when a value is being typed in
      map(input => typeof input === 'string' ? input : input?.fullName),
      tap(searchTerm => {
        this.searchTerm = searchTerm;
        this.invalidSearchTerm = false;
      }),
      filter((searchTerm: string) => searchTerm && searchTerm.length > this.minSearchCharacters),
      switchMap((searchTerm: string) => this.filterJudicialUsers(searchTerm).pipe(
        tap((judicialUsers) => {
          this.showAutocomplete = true;
          this.noResults = !this.invalidSearchTerm && judicialUsers.length === 0;
        })
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
      switchMap(serviceDetails => {
        return this.jurisdictionService.searchJudicialUsers(searchTerm, serviceDetails[0].service_code).pipe(
          // Handle any errors here rather than outside of the function, so that the outer Observable is kept live
          catchError(_ => {
            this.invalidSearchTerm = true;
            return of(undefined);
          })
        );
      })
    );
  }

  public loadJudicialUser(personalCode: string): void {
    if (personalCode) {
      this.jurisdictionService.searchJudicialUsersByPersonalCodes([personalCode]).pipe(take(1)).subscribe(judicialUsers => {
        this.judicialUserControl.setValue(judicialUsers[0]);
      });
    }
  }

  public displayJudicialUser(judicialUser?: JudicialUserModel): string | undefined {
    return judicialUser
      ? `${judicialUser.fullName ? judicialUser.fullName : ''}${judicialUser.emailId ? ` (${judicialUser.emailId})` : ''}`
      : undefined;
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
    this.judicialUserSelected = true;
  }

  public onBlur(event: any): void {
    // If the user types into the JudicialUser field but doesn't select a value from the autocomplete list, reset the
    // FormControl value to null to ensure it fails validation (can check the event.relatedTarget property)
    if (event.relatedTarget?.role !== 'option' && !this.judicialUserSelected) {
      // If relatedTarget.role is not "option", it means the user didn't select a value
      this.judicialUserControl.setValue(null);
    }

    if (!this.judicialUserControl.value) {
      // If the user deletes the field value, set the caseField value and the values of the two FormControls for
      // idamId and personalCode to null. This is to avoid judicial user data being present in the data payload
      // unintentionally
      this.caseField.value = null;
      this.complexGroup.get('idamId')?.setValue(null);
      this.complexGroup.get('personalCode')?.setValue(null);
    }
  }

  public setupValidation(): void {
    // Need to remove validators from the two FormControls, idamId and personalCode, for the JudicialUser complex
    // field type. This prevents these hidden fields being listed in an error message if there are validation errors
    this.complexGroup.get('idamId').clearValidators();
    this.complexGroup.get('personalCode').clearValidators();
    if (this.caseField.display_context === Constants.MANDATORY) {
      this.judicialUserControl.setValidators(Validators.required);
    }
  }

  public ngOnDestroy(): void {
    this.jurisdictionSubscription?.unsubscribe();
  }
}
