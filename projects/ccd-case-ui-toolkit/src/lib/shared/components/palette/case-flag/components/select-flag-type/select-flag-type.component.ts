import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ErrorMessage } from '../../../../../domain';
import { FlagType } from '../../../../../domain/case-flag';
import { CaseFlagRefdataService } from '../../../../../services';
import { RefdataCaseFlagType } from '../../../../../services/case-flag/refdata-case-flag-type.enum';
import { CaseFlagState } from '../../domain';
import { CaseFlagFieldState, CaseFlagFormFields, CaseFlagWizardStepTitle, SelectFlagTypeErrorMessage } from '../../enums';
import { SearchLanguageInterpreterControlNames } from '../search-language-interpreter/search-language-interpreter-control-names.enum';

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

  @Input()
  public caseTypeId: string;

  @Input()
  public hmctsServiceId: string;

  @Input()
  public isDisplayContextParameterExternal = false;

  @Output()
  public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  @Output()
  public flagCommentsOptionalEmitter: EventEmitter<any> = new EventEmitter();

  public flagTypes: FlagType[];
  public errorMessages: ErrorMessage[];
  public flagTypeNotSelectedErrorMessage = '';
  public flagTypeErrorMessage = '';
  public flagRefdata$: Subscription;
  public refdataError = false;
  public cachedPath: (FlagType | false)[];
  public selectionTitle = '';

  public flagTypeControlChangesSubscription: Subscription;

  private readonly maxCharactersForOtherFlagType = 80;
  public caseFlagFormField = CaseFlagFormFields;
  // Code for "Other" flag type as defined in Reference Data
  private readonly otherFlagTypeCode = 'OT0001';
  public readonly caseLevelCaseFlagsFieldId = 'caseFlags';

  public get caseFlagWizardStepTitle(): typeof CaseFlagWizardStepTitle {
    return CaseFlagWizardStepTitle;
  }
  public get selectedFlagType(): FlagType | null {
    return this.formGroup.get(CaseFlagFormFields.FLAG_TYPE)?.value;
  }
  public get otherFlagTypeSelected(): boolean {
    return this.formGroup.get(CaseFlagFormFields.FLAG_TYPE)?.value?.flagCode === this.otherFlagTypeCode;
  }

  constructor(private readonly caseFlagRefdataService: CaseFlagRefdataService) { }

  public ngOnInit(): void {
    this.flagTypes = [];
    const flagType = this.formGroup['caseField']
      && this.formGroup['caseField'].id
      && this.formGroup['caseField'].id === this.caseLevelCaseFlagsFieldId
      ? RefdataCaseFlagType.CASE
      : RefdataCaseFlagType.PARTY;

    this.formGroup.addControl(CaseFlagFormFields.FLAG_TYPE, new FormControl(''));
    this.formGroup.addControl(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION, new FormControl(''));

    // Should clear descriptionControlName if flagTypeControlName is changed
    this.flagTypeControlChangesSubscription = this.formGroup.get(CaseFlagFormFields.FLAG_TYPE).valueChanges
      .subscribe(_ => {
        this.formGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION).setValue('');
        this.cachedPath = [];

        // required to clear language interpreter
        this.formGroup.patchValue({
          [SearchLanguageInterpreterControlNames.LANGUAGE_SEARCH_TERM]: '',
          [SearchLanguageInterpreterControlNames.MANUAL_LANGUAGE_ENTRY]: ''
        });
      }
    );

    // If hmctsServiceId is present, use this to retrieve the relevant list of flag types
    if (this.hmctsServiceId) {
      this.flagRefdata$ = this.caseFlagRefdataService
        .getCaseFlagsRefdata(this.hmctsServiceId, flagType, false, this.isDisplayContextParameterExternal)
        .subscribe({
          next: flagTypes => {
            // First (and only) object in the returned array should be the top-level "Party" flag type
            this.flagTypes = flagTypes[0].childFlags;

            const formControl = this.formGroup.get(CaseFlagFormFields.FLAG_TYPE);
            if (formControl?.value) {
              // Cache Path based on existing flagCode -- needed for nested choices
              const [foundFlagType, path] = FlagType.searchPathByFlagTypeObject(formControl.value as FlagType, this.flagTypes);
              this.cachedPath = [
                ...path,
                foundFlagType
              ];
              formControl.setValue(this.cachedPath[0], { emitEvent: false });
            }
          },
          error: error => this.onRefdataError(error)
        });
    } else {
      // Else, HMCTS service code is required to retrieve the relevant list of flag types; attempt to obtain it by case type ID first
      this.flagRefdata$ = this.caseFlagRefdataService.getHmctsServiceDetailsByCaseType(this.caseTypeId)
        .pipe(
          // If an error occurs retrieving HMCTS service details by case type ID, try by service name instead
          catchError(_ => this.caseFlagRefdataService.getHmctsServiceDetailsByServiceName(this.jurisdiction)),
          // Use switchMap to return an inner Observable of the flag types data, having received the service details
          // including service_code. This avoids having nested `subscribe`s, which is an anti-pattern!
          switchMap(serviceDetails => this.caseFlagRefdataService.getCaseFlagsRefdata(serviceDetails[0].service_code, flagType,
            false, this.isDisplayContextParameterExternal))
        )
        .subscribe({
          next: flagTypes => {
            // First (and only) object in the returned array should be the top-level "Party" flag type
            this.flagTypes = flagTypes[0].childFlags;

            const formControl = this.formGroup.get(CaseFlagFormFields.FLAG_TYPE);
            if (formControl?.value) {
              // Cache Path based on existing flagCode -- needed for nested choices
              const [foundFlagType, path] = FlagType.searchPathByFlagTypeObject(formControl.value as FlagType, this.flagTypes);
              this.cachedPath = [
                ...path,
                foundFlagType
              ];
              formControl.setValue(this.cachedPath[0], { emitEvent: false });
            }
          },
          error: error => this.onRefdataError(error)
        });
    }
  }

  public ngOnDestroy(): void {
    if (this.flagRefdata$) {
      this.flagRefdata$.unsubscribe();
    }
    this.flagTypeControlChangesSubscription?.unsubscribe();
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
      // Include the "list of values" (if any); currently applicable to language flag types
    });
    // Emit "flag comments optional" event if the user selects a child flag type where comments are not mandatory
    if (this.selectedFlagType && !this.selectedFlagType.isParent && !this.selectedFlagType.flagComment) {
      this.flagCommentsOptionalEmitter.emit(null);
    }

    // If the selected flag type is a parent, load the list of child flag types and reset the current selection
    if (this.selectedFlagType && this.selectedFlagType.isParent) {
      this.selectionTitle = this.selectedFlagType.name;

      this.flagTypes = this.selectedFlagType.childFlags;
      this.cachedPath?.shift();
      this.formGroup.get(CaseFlagFormFields.FLAG_TYPE).setValue(this.cachedPath?.length ? this.cachedPath[0] : null, { emitEvent: false });
    }
  }

  private validateForm(): void {
    this.flagTypeNotSelectedErrorMessage = '';
    this.flagTypeErrorMessage = '';
    this.errorMessages = [];

    if (!this.selectedFlagType) {
      // If there is any selection then the message will differ. We use the selectionTitle property
      if (this.selectionTitle) {
        this.flagTypeNotSelectedErrorMessage = SelectFlagTypeErrorMessage.FLAG_TYPE_OPTION_NOT_SELECTED;
      } else {
        this.flagTypeNotSelectedErrorMessage = this.isDisplayContextParameterExternal
          ? SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_SELECTED_EXTERNAL
          : SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_SELECTED;
      }
      this.errorMessages.push({title: '', description: this.flagTypeNotSelectedErrorMessage, fieldId: 'conditional-radios-list'});
    }
    if (this.otherFlagTypeSelected) {
      const otherFlagTypeDescription = this.formGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION).value;
      if (!otherFlagTypeDescription) {
        this.flagTypeErrorMessage = this.isDisplayContextParameterExternal
          ? SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_ENTERED_EXTERNAL
          : SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_ENTERED;
        this.errorMessages.push({title: '', description: `${this.flagTypeErrorMessage}`, fieldId: 'other-flag-type-description'});
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
