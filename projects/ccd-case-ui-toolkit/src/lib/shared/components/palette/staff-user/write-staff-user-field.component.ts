import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Constants } from '../../../commons/constants';
import { CaseFlagRefdataService, FieldsUtils, FormValidatorsService, JurisdictionService } from '../../../services';
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
  public staffUserControl: AbstractControl;
  public jurisdiction: string;
  public caseType: string;
  public jurisdictionSubscription: Subscription;
  private notifierSubscription: Subscription;

  constructor(
    private readonly jurisdictionService: JurisdictionService,
    private readonly caseFlagRefdataService: CaseFlagRefdataService,
    private readonly compoundPipe: IsCompoundPipe,
    private readonly validatorsService: FormValidatorsService,
    private readonly caseNotifier: CaseNotifier
  ) {
    super(compoundPipe, validatorsService);
    this.jurisdictionSubscription = this.jurisdictionService.getSelectedJurisdiction()?.subscribe(jurisdiction => {
      if (jurisdiction?.currentCaseType) {
        this.jurisdiction = jurisdiction.id;
        this.caseType = jurisdiction.currentCaseType.id;
      }
    });
    this.notifierSubscription = this.caseNotifier.caseView.subscribe(caseDetails => {
      if (caseDetails) {
        this.jurisdiction = caseDetails.case_type?.jurisdiction?.id;
        this.caseType = caseDetails.case_type?.id;
      }
    });
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.staffUserControl = new FormControl(this.caseField.value?.displayName);
    this.formGroup.setControl(`${this.caseField.id}_staffUserControl`, this.staffUserControl);
    FieldsUtils.addCaseFieldAndComponentReferences(this.staffUserControl, this.caseField, this);
    this.setupValidation();
  }

  public resolveServiceCode(): Observable<string> {
    const caseType = this.getBaseCaseType();
    return this.caseFlagRefdataService.getHmctsServiceDetailsByCaseType(caseType).pipe(
      catchError(() => this.caseFlagRefdataService.getHmctsServiceDetailsByServiceName(this.jurisdiction)),
      map(serviceDetails => {
        return serviceDetails[0].service_code;
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

  public ngOnDestroy(): void {
    this.jurisdictionSubscription?.unsubscribe();
    this.notifierSubscription?.unsubscribe();
  }

  private getBaseCaseType(): string {
    const caseType = this.caseType || this.jurisdictionService.getSelectedJurisdiction()?.getValue()?.currentCaseType?.id;
    return caseType?.split('-')[0];
  }
}
