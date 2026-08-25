import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { Constants } from '../../../commons/constants';
import { StaffUser, parseStaffUserSearchConfiguration } from '../../../domain/work-allocation';
import { HmctsServiceDetail } from '../../../domain/case-flag';
import { CaseFlagRefdataService, FieldsUtils, FormValidatorsService, JurisdictionService } from '../../../services';
import { CaseworkerService } from '../../case-editor/services/case-worker.service';
import { WriteComplexFieldComponent } from '../complex/write-complex-field.component';
import { IsCompoundPipe } from '../utils/is-compound.pipe';
import { CaseNotifier } from '../../case-editor/services/case.notifier';

@Component({
  selector: 'ccd-write-staff-user-field',
  styleUrls: ['./write-staff-user-field.component.scss'],
  templateUrl: './write-staff-user-field.component.html',
  standalone: false
})
export class WriteStaffUserFieldComponent extends WriteComplexFieldComponent implements OnInit, OnDestroy {
  public readonly minSearchCharacters = 2;
  public staffUserControl: AbstractControl;
  public jurisdiction: string;
  public caseType: string;
  public filteredStaffUsers$: Observable<StaffUser[]>;
  public showAutocomplete = false;
  public noResults = false;
  public invalidSearchTerm = false;
  public searchTerm = '';
  public errors: ValidationErrors;
  public staffUserSelected = false;
  public jurisdictionSubscription: Subscription;
  private notifierSubscription: Subscription;

  constructor(
    private readonly jurisdictionService: JurisdictionService,
    private readonly caseFlagRefdataService: CaseFlagRefdataService,
    private readonly caseworkerService: CaseworkerService,
    private readonly compoundPipe: IsCompoundPipe,
    private readonly validatorsService: FormValidatorsService,
    private readonly caseNotifier: CaseNotifier
  ) {
    super(compoundPipe, validatorsService);
    this.jurisdictionSubscription = this.jurisdictionService.getSelectedJurisdiction()?.subscribe(jurisdiction => {
      console.log('this.jurisdictionSubscription jurisdiction: ', jurisdiction);
      if (jurisdiction?.currentCaseType) {
        this.jurisdiction = jurisdiction.id ?? this.jurisdiction;
        this.caseType = jurisdiction.currentCaseType.id ?? this.caseType;
      }
    });
    this.notifierSubscription = this.caseNotifier.caseView.subscribe(caseDetails => {
      console.log('this.notifierSubscription caseDetails: ', caseDetails);
      if (caseDetails) {
        this.jurisdiction = caseDetails.case_type?.jurisdiction?.id ?? this.jurisdiction;
        this.caseType = caseDetails.case_type?.id ?? this.caseType;
      }
    });
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.staffUserControl = new FormControl(this.caseField.value?.displayName);
    this.formGroup.setControl(`${this.caseField.id}_staffUserControl`, this.staffUserControl);
    FieldsUtils.addCaseFieldAndComponentReferences(this.staffUserControl, this.caseField, this);
    this.setupValidation();
    this.staffUserSelected = !!this.caseField.value?.idamId;
    this.filteredStaffUsers$ = this.staffUserControl.valueChanges.pipe(
      tap(value => {
        this.showAutocomplete = false;
        if (typeof value === 'string' && value !== this.caseField.value?.displayName) {
          this.staffUserSelected = false;
          this.clearSelection();
        }
      }),
      debounceTime(300),
      filter((value): value is string => typeof value === 'string' && value.length > this.minSearchCharacters),
      tap(searchTerm => {
        this.searchTerm = searchTerm;
        this.invalidSearchTerm = false;
      }),
      switchMap(searchTerm => this.filterStaffUsers(searchTerm).pipe(
        tap(staffUsers => {
          this.showAutocomplete = true;
          this.noResults = !this.invalidSearchTerm && staffUsers.length === 0;
        })
      ))
    );
    console.log('oninit this.jurisdiction: ', this.jurisdiction);
    console.log('oninit this.caseType: ', this.caseType);
  }

  public filterStaffUsers(searchTerm: string): Observable<StaffUser[]> {
    const configuration = parseStaffUserSearchConfiguration(this.getDisplayContextParameter());
    console.log('configuration: ', configuration);
    if (!configuration.valid) {
      this.invalidSearchTerm = true;
      return of([]);
    }

    return this.resolveServiceDetails().pipe(
      switchMap(serviceDetails => {
        const searches: Observable<StaffUser[]>[] = [];
        if (configuration.configuration.staffRoleCategories.length) {
          searches.push(this.caseworkerService.searchStaffUsers(
            [serviceDetails.ccd_service_name],
            searchTerm,
            configuration.configuration.staffRoleCategories,
            configuration.configuration.regions));
        }
        if (configuration.configuration.includesJudicial) {
          searches.push(this.jurisdictionService.searchJudicialUsers(
            searchTerm, serviceDetails.service_code, configuration.configuration.regions).pipe(
            map(judicialUsers => judicialUsers.map(judicialUser => ({
              idamId: judicialUser.idamId,
              displayName: judicialUser.fullName || '',
              ...(judicialUser.emailId ? { emailId: judicialUser.emailId } : {})
            })))
          ));
        }
        return forkJoin(searches).pipe(map(results => this.removeDuplicateUsers(results)));
      }),
      catchError(() => {
        this.invalidSearchTerm = true;
        return of([]);
      })
    );
  }

  public resolveServiceCode(): Observable<string> {
    return this.resolveServiceDetails().pipe(map(serviceDetails => serviceDetails.service_code));
  }

  public resolveServiceDetails(): Observable<HmctsServiceDetail> {
    const caseType = this.getBaseCaseType();
    console.log('caseType: ', caseType);
    return this.caseFlagRefdataService.getHmctsServiceDetailsByCaseType(caseType).pipe(
      catchError(() => this.caseFlagRefdataService.getHmctsServiceDetailsByServiceName(this.jurisdiction)),
      map(serviceDetails => {
        console.log(`Resolved service details for case type ${caseType}:`, serviceDetails);
        return serviceDetails[0];
      })
    );
  }

  public setupValidation(): void {
    this.complexGroup.get('idamId')?.clearValidators();
    this.complexGroup.get('displayName')?.clearValidators();
    if (this.caseField.display_context === Constants.MANDATORY) {
      this.staffUserControl.setValidators(Validators.required);
    }
  }

  public displayStaffUser(staffUser?: StaffUser): string | undefined {
    return staffUser?.displayName;
  }

  public onSelectionChange(event: any): void {
    const staffUser = event.source.value as StaffUser;
    if (!staffUser) {
      return;
    }
    this.caseField.value = { idamId: staffUser.idamId, displayName: staffUser.displayName };
    this.complexGroup.get('idamId')?.setValue(staffUser.idamId);
    this.complexGroup.get('displayName')?.setValue(staffUser.displayName);
    this.staffUserSelected = true;
  }

  public onBlur(event: any): void {
    if (event.relatedTarget?.role !== 'option' && !this.staffUserSelected) {
      this.staffUserControl.setValue(null);
      this.clearSelection();
    }
  }

  public ngOnDestroy(): void {
    this.jurisdictionSubscription?.unsubscribe();
    this.notifierSubscription?.unsubscribe();
  }

  private getBaseCaseType(): string {
    const caseType = this.caseType || this.jurisdictionService.getSelectedJurisdiction()?.getValue()?.currentCaseType?.id;
    return caseType?.split('-')[0];
  }

  /**
   * The search filters are configured through the field's display_context_parameter, for example
   * `#ARGUMENT(CATEGORY-LEGAL-OPS,CATEGORY-ADMIN,REGION-1235)`.
   *
   * When this component is rendered for a field nested within a complex type or collection, the
   * CaseField instance handed to the component can be the child definition, which does not always
   * carry the parameter. Fall back to the matching field in the page's context fields.
   */
  private getDisplayContextParameter(): string {
    return this.caseField?.display_context_parameter
      || this.caseFields?.find(caseField => caseField.id === this.caseField?.field_type?.id)?.display_context_parameter;
  }

  private clearSelection(): void {
    this.caseField.value = null;
    this.complexGroup.get('idamId')?.setValue(null);
    this.complexGroup.get('displayName')?.setValue(null);
  }

  private removeDuplicateUsers(results: StaffUser[][]): StaffUser[] {
    const usersByIdamId = new Map<string, StaffUser>();
    results.forEach(users => users.forEach(user => {
      if (!usersByIdamId.has(user.idamId)) {
        usersByIdamId.set(user.idamId, user);
      }
    }));
    return Array.from(usersByIdamId.values());
  }
}
