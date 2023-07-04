import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
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

  public judicialUserControl: AbstractControl;
  public judicialUserFormGroup: FormGroup;
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
    console.log('CASE FIELD', this.caseField);
    if (this.caseField.value) {
      this.judicialUserFormGroup = this.registerControl(new FormGroup({
        JudicialUser: new FormControl(this.caseField.value.JudicialUser)
      }), true) as FormGroup;
    } else {
      this.judicialUserFormGroup = this.registerControl(new FormGroup({
        JudicialUser: new FormControl(null)
      }), true) as FormGroup;
    }
    this.judicialUserControl = this.judicialUserFormGroup.controls['JudicialUser'];

    this.setJurisdictionAndCaseType();

    this.sub = this.judicialUserControl.valueChanges.pipe(
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

    if (this.caseField.value?.personalCode) {
      this.loadJudicialUser(this.caseField.value.personalCode);
    }
  }

  public filterJudicialUsers(searchTerm: string): Observable<JudicialUserModel[]> {
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

  // public onSelectionChange(judicialUser: JudicialUserModel): void {
  //   this.idamIdFormControl.setValue(`${judicialUser.fullName} (${judicialUser.emailId})`);
  //   this.personalCodeFormControl.setValue(judicialUser.personalCode);
  // }

  public ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
