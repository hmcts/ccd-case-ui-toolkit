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
  private selectionTitles = [];
  public get selectionTitlesString() {
    return this.selectionTitles.join(' > ');
  }

  public readonly flagTypeControlName = 'flagType';
  public readonly descriptionControlName = 'otherFlagTypeDescription';
  public flagTypeControlChangesSubscription: Subscription;

  private readonly maxCharactersForOtherFlagType = 80;
  // Code for "Other" flag type as defined in Reference Data
  private readonly otherFlagTypeCode = 'OT0001';
  public readonly caseLevelCaseFlagsFieldId = 'caseFlags';

  public get caseFlagWizardStepTitle(): typeof CaseFlagWizardStepTitle {
    return CaseFlagWizardStepTitle;
  }
  public get selectedFlagType(): FlagType | null {
    return this.formGroup.get(this.flagTypeControlName)?.value;
  }
  public get otherFlagTypeSelected(): boolean {
    return this.formGroup.get(this.flagTypeControlName)?.value?.flagCode === this.otherFlagTypeCode;
  }

  constructor(private readonly caseFlagRefdataService: CaseFlagRefdataService) { }

  public ngOnInit(): void {
    this.flagTypes = [];
    const flagType = this.formGroup['caseField']
      && this.formGroup['caseField'].id
      && this.formGroup['caseField'].id === this.caseLevelCaseFlagsFieldId
      ? RefdataCaseFlagType.CASE
      : RefdataCaseFlagType.PARTY;

    if (!this.formGroup.get(this.flagTypeControlName)) {
      this.formGroup.addControl(this.flagTypeControlName, new FormControl(''));
    }
    if (!this.formGroup.get(this.descriptionControlName)) {
      this.formGroup.addControl(this.descriptionControlName, new FormControl(''));
    }

    // Should clear descriptionControlName if flagTypeControlName is changed
    this.flagTypeControlChangesSubscription = this.formGroup.get(this.flagTypeControlName).valueChanges
      .subscribe(value => {
        this.formGroup.get(this.descriptionControlName).setValue('');
        this.cachedPath = [];

        // required to clear language interpreter
        this.formGroup.patchValue({
          [SearchLanguageInterpreterControlNames.LANGUAGE_SEARCH_TERM]: '',
          [SearchLanguageInterpreterControlNames.MANUAL_LANGUAGE_ENTRY]: ''
        });
      }
    );

    // HMCTS service code for a given jurisdiction is required to retrieve the relevant list of flag types
    this.flagRefdata$ = this.caseFlagRefdataService.getHmctsServiceDetails(this.jurisdiction)
      .pipe(
        // Use switchMap to return an inner Observable of the flag types data, having received the service details
        // including service_code. This avoids having nested `subscribe`s, which is an anti-pattern!
        switchMap(serviceDetails => {
          return this.caseFlagRefdataService.getCaseFlagsRefdata(serviceDetails[0].service_code, flagType);
        }),
      )
      .subscribe({
        next: flagTypes => {
          // First (and only) object in the returned array should be the top-level "Party" flag type
          this.flagTypes = flagTypes[0].childFlags;

          const formControl = this.formGroup.get(this.flagTypeControlName);
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
        error: error => {
          this.onRefdataError(error);
        }
      });
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
    // Emit "flag comments optional" event if the user selects a flag type where comments are not mandatory
    if (this.selectedFlagType && !this.selectedFlagType.flagComment) {
      this.flagCommentsOptionalEmitter.emit(null);
    }

    // If the selected flag type is a parent, load the list of child flag types and reset the current selection
    if (this.selectedFlagType && this.selectedFlagType.isParent) {
      this.selectionTitles.push(this.selectedFlagType.name);

      this.flagTypes = this.selectedFlagType.childFlags;
      this.cachedPath?.shift();
      this.formGroup.get(this.flagTypeControlName).setValue(this.cachedPath?.length ? this.cachedPath[0] : null, { emitEvent: false });
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
