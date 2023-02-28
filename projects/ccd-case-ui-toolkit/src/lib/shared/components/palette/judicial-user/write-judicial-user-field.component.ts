import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { catchError, debounceTime, filter, switchMap, tap } from 'rxjs/operators';
import { JudicialUserModel } from '../../../domain/jurisdiction';
import { CaseFlagRefdataService, JurisdictionService, SessionStorageService } from '../../../services';
import { AbstractFieldWriteComponent } from '../base-field';

@Component({
  selector: 'ccd-write-judicial-user-field',
  styleUrls: ['./write-judicial-user-field.component.scss'],
  templateUrl: './write-judicial-user-field.component.html'
})
export class WriteJudicialUserFieldComponent extends AbstractFieldWriteComponent implements OnInit, OnDestroy {

  private readonly MINIMUM_SEARCH_CHARACTERS = 2;
  private readonly IDAM_ID = 'idamId';
  private readonly PERSONAL_CODE = 'personalCode';

  public judicialUserFormGroup: FormGroup;
  public idamIdFormControl: FormControl;
  public personalCodeFormControl: FormControl;
  public jurisdiction: string;
  public caseType: string;
  public filteredJudicialUsers: JudicialUserModel[] = [];
  public showAutocomplete = false;
  public sub: Subscription;

  constructor(private readonly jurisdictionService: JurisdictionService,
              private readonly sessionStorageService: SessionStorageService,
              private readonly caseFlagRefDataService: CaseFlagRefdataService) {
    super();
  }

  public ngOnInit(): void {
    this.judicialUserFormGroup = this.registerControl(new FormGroup({}), true) as FormGroup;
    this.idamIdFormControl = new FormControl('');
    this.judicialUserFormGroup.addControl(this.IDAM_ID, this.idamIdFormControl);
    this.personalCodeFormControl = new FormControl('');
    this.judicialUserFormGroup.addControl(this.PERSONAL_CODE, this.personalCodeFormControl);

    this.setJurisdictionAndCaseType();

    this.sub = this.idamIdFormControl.valueChanges.pipe(
      tap(() => this.showAutocomplete = false),
      tap(() => this.filteredJudicialUsers = []),
      debounceTime(300),
      filter((searchTerm: string) => searchTerm && searchTerm.length > this.MINIMUM_SEARCH_CHARACTERS),
      switchMap((searchTerm: string) => this.filterJudicialUsers(searchTerm).pipe(
        tap(() => this.showAutocomplete = true),
        catchError(() => this.filteredJudicialUsers = [])
      ))
    ).subscribe((judicialUsers: JudicialUserModel[]) => {
      this.filteredJudicialUsers = judicialUsers;
    });

    console.log('CASE FIELD', this.caseField.value);

    if (this.caseField.value?.personalCode) {
      this.loadJudicialUser(this.caseField.value.personalCode);
    }
  }

  public filterJudicialUsers(searchTerm: string): Observable<JudicialUserModel[]> {
    console.log('SEARCH TERM', searchTerm);
    return this.caseFlagRefDataService.getHmctsServiceDetailsByCaseType(this.caseType).pipe(
      // If an error occurs retrieving HMCTS service details by case type ID, try by service name instead
      catchError(_ => this.caseFlagRefDataService.getHmctsServiceDetailsByServiceName(this.jurisdiction)),
      // Use switchMap to return an inner Observable of the flag types data, having received the service details
      // including service_code. This avoids having nested `subscribe`s, which is an anti-pattern!
      switchMap(serviceDetails => this.jurisdictionService.searchJudicialUsers(searchTerm, serviceDetails[0].service_code))
    );
  }

  public loadJudicialUser(personalCode: string): void {
    if (personalCode) {
      this.jurisdictionService.searchJudicialUsersByPersonalCodes([personalCode]).subscribe(judicialUsers => {
        const judicialUser = judicialUsers[0];
        this.idamIdFormControl.setValue(`${judicialUser.fullName} (${judicialUser.emailId})`);
        this.personalCodeFormControl.setValue(judicialUser.personalCode);
      });
    }
  }

  public setJurisdictionAndCaseType(): void {
    const caseInfoStr = this.sessionStorageService.getItem('caseInfo');
    console.log('CASE INFO STR', caseInfoStr);
    if (caseInfoStr) {
      const caseInfo = JSON.parse(caseInfoStr);
      this.jurisdiction = caseInfo?.jurisdiction;
      this.caseType = caseInfo?.caseType;
    }
  }

  public onSelectionChange(judicialUser: JudicialUserModel): void {
    this.idamIdFormControl.setValue(`${judicialUser.fullName} (${judicialUser.emailId})`);
    this.personalCodeFormControl.setValue(judicialUser.personalCode);
  }

  public ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
