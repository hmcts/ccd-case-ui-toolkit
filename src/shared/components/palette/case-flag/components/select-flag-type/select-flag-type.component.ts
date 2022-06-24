import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ErrorMessage } from '../../../../../domain';
import { FlagType } from '../../../../../domain/case-flag';
import { CaseFlagRefdataService } from '../../../../../services';
import { RefdataCaseFlagType } from '../../../../../services/case-flag/refdata-case-flag-type.enum';
import { CaseFlagState } from '../../domain';
import { CaseFlagFieldState, CaseFlagWizardStepTitle, SelectFlagTypeErrorMessage } from '../../enums';

@Component({
  selector: 'ccd-select-flag-type',
  templateUrl: './select-flag-type.component.html',
  styleUrls: ['./select-flag-type.component.scss']
})
export class SelectFlagTypeComponent implements OnInit, OnDestroy {

  @Input()
  public formGroup: FormGroup;

  @Input()
  public jurisdiction: string;

  @Output()
  public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  @Output()
  public flagCommentsOptionalEmitter: EventEmitter<any> = new EventEmitter();

  public flagTypes: FlagType[];
  public selectedFlagType: FlagType;
  public errorMessages: ErrorMessage[];
  public flagTypeNotSelectedErrorMessage = '';
  public flagTypeErrorMessage = '';
  public flagRefdata$: Subscription;
  public otherFlagTypeSelected = false;
  public refdataError = false;

  public readonly flagTypeControlName = 'flagType';
  public readonly descriptionControlName = 'otherFlagTypeDescription';
  private readonly maxCharactersForOtherFlagType = 80;
  // Code for "Other" flag type as defined in Reference Data
  private readonly otherFlagTypeCode = 'OT0001';
  public readonly caseLevelCaseFlagsFieldId = 'caseFlags';

  public get caseFlagWizardStepTitle(): typeof CaseFlagWizardStepTitle {
    return CaseFlagWizardStepTitle
  }

  constructor(private readonly caseFlagRefdataService: CaseFlagRefdataService) { }

  public ngOnInit(): void {
    this.flagTypes = [];
    this.formGroup.addControl(this.flagTypeControlName, new FormControl(''));
    this.formGroup.addControl(this.descriptionControlName, new FormControl(''));

    const flagType = this.formGroup['caseField'] && this.formGroup['caseField'].id && this.formGroup['caseField'].id === this.caseLevelCaseFlagsFieldId
      ? RefdataCaseFlagType.CASE
      : RefdataCaseFlagType.PARTY;

    // HMCTS service code for a given jurisdiction is required to retrieve the relevant list of flag types
    this.flagRefdata$ = this.caseFlagRefdataService.getHmctsServiceDetails(this.jurisdiction)
      .pipe(
        // Use switchMap to return an inner Observable of the flag types data, having received the service details
        // including service_code. This avoids having nested `subscribe`s, which is an anti-pattern!
        switchMap(serviceDetails => {
          return this.caseFlagRefdataService.getCaseFlagsRefdata(serviceDetails[0].service_code, flagType);
        })
      )
      .subscribe({
        next: flagTypes => {
          // First (and only) object in the returned array should be the top-level "Party" flag type
          this.flagTypes = flagTypes[0].childFlags;
        },
        error: error => {
          this.onRefdataError(error);
        }
      });
  }

  public ngOnDestroy(): void {
    if (this.flagRefdata$) {
      this.flagRefdata$.unsubscribe();
    }
  }

  public onFlagTypeChanged(flagType: FlagType): void {
    this.selectedFlagType = flagType;
    // Display description textbox if 'Other' flag type is selected
    this.otherFlagTypeSelected = this.selectedFlagType.flagCode === this.otherFlagTypeCode;
  }

  public onNext(): void {
    // Validate form
    this.validateForm();
    // Return case flag field state, whether the selected flag type (if any) is a parent or not, error messages,
    // flag name, path, hearing relevant indicator, code, and "list of values" (if any) to the parent
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE,
      isParentFlagType: this.selectedFlagType ? this.selectedFlagType.isParent : null,
      errorMessages: this.errorMessages,
      flagName: this.selectedFlagType ? this.selectedFlagType.name : null,
      flagPath: this.selectedFlagType ? this.selectedFlagType.Path : null,
      hearingRelevantFlag: this.selectedFlagType ? this.selectedFlagType.hearingRelevant : null,
      flagCode: this.selectedFlagType ? this.selectedFlagType.flagCode : null,
      // Include the "list of values" (if any); currently applicable to language flag types
      listOfValues: this.selectedFlagType && this.selectedFlagType.listOfValues && this.selectedFlagType.listOfValues.length > 0
        ? this.selectedFlagType.listOfValues
        : null
    });
    // Emit "flag comments optional" event if the user selects a flag type where comments are not mandatory
    if (this.selectedFlagType && !this.selectedFlagType.flagComment) {
      this.flagCommentsOptionalEmitter.emit(null);
    }
    // If the selected flag type is a parent, load the list of child flag types and reset the current selection
    if (this.selectedFlagType && this.selectedFlagType.isParent) {
      this.flagTypes = this.selectedFlagType.childFlags;
      this.formGroup.get(this.flagTypeControlName).setValue('');
      this.selectedFlagType = null;
    }
  }

  private validateForm(): void {
    this.flagTypeNotSelectedErrorMessage = '';
    this.flagTypeErrorMessage = '';
    this.errorMessages = [];

    if (!this.selectedFlagType) {
      this.flagTypeNotSelectedErrorMessage = SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_SELECTED;
      this.errorMessages.push({title: '', description: `${SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_SELECTED}`, fieldId: 'conditional-radios-list'});
    }
    if (this.otherFlagTypeSelected) {
      const otherFlagTypeDescription = this.formGroup.get(this.descriptionControlName).value;
      if (!otherFlagTypeDescription) {
        this.flagTypeErrorMessage = SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_ENTERED;
        this.errorMessages.push({title: '', description: `${SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_ENTERED}`, fieldId: 'other-flag-type-description'});
      }
      if (otherFlagTypeDescription.length > this.maxCharactersForOtherFlagType) {
        this.flagTypeErrorMessage = SelectFlagTypeErrorMessage.FLAG_TYPE_LIMIT_EXCEEDED;
        this.errorMessages.push({title: '', description: `${SelectFlagTypeErrorMessage.FLAG_TYPE_LIMIT_EXCEEDED}`, fieldId: 'other-flag-type-description'});
      }
    }
  }

  private onRefdataError(error: any): void {
    // Set error flag on component to remove the "Next" button (user cannot proceed with flag creation)
    this.refdataError = true;
    this.errorMessages = [];
    this.errorMessages.push({title: '', description: error.message, fieldId: 'conditional-radios-list'});
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE, errorMessages: this.errorMessages });
  }
}
