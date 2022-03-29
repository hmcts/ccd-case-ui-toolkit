import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
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

  public get caseFlagWizardStepTitle(): typeof CaseFlagWizardStepTitle {
    return CaseFlagWizardStepTitle
  }

  constructor(private readonly caseFlagRefdataService: CaseFlagRefdataService) { }

  public ngOnInit(): void {
    this.flagTypes = [];
    this.formGroup.addControl(this.flagTypeControlName, new FormControl(''));
    this.formGroup.addControl(this.descriptionControlName, new FormControl(''));

    // HMCTS service code should come from Refdata API lookup via getHmctsServiceCode() but this is not working in AAT;
    // use test service code 'AAA1' for now
    this.flagRefdata$ = this.caseFlagRefdataService.getCaseFlagsRefdata('AAA1', RefdataCaseFlagType.PARTY).subscribe({
      next: flagTypes => {
        // First (and only) object in the returned array should be the top-level "Party" flag type
        flagTypes[0].childFlags.forEach(flagType => {
          this.flagTypes.push(flagType);
        });
      },
      error: error => {
        // Set error flag on component to remove the "Next" button (user cannot proceed with flag creation)
        this.refdataError = true;
        this.errorMessages = [];
        this.errorMessages.push({title: '', description: error.message, fieldId: 'conditional-radios-list'});
        // Return case flag field state and error messages to the parent
        this.caseFlagStateEmitter.emit({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE, errorMessages: this.errorMessages });
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
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE, errorMessages: this.errorMessages });
    // Emit "flag comments optional" event if the user selects a flag type where comments are not mandatory
    if (this.selectedFlagType && !this.selectedFlagType.flagComment) {
      this.flagCommentsOptionalEmitter.emit(null);
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
}
