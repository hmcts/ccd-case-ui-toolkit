import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ErrorMessage, Journey } from '../../../../../domain';
import { FlagType } from '../../../../../domain/case-flag';
import { CaseFlagRefdataService, MultipageComponentStateService } from '../../../../../services';
import { RefdataCaseFlagType } from '../../../../../services/case-flag/refdata-case-flag-type.enum';
import { CaseFlagState, FlagsWithFormGroupPath } from '../../domain';
import { CaseFlagFieldState, CaseFlagFormFields, CaseFlagWizardStepTitle, SelectFlagTypeErrorMessage } from '../../enums';
import { AbstractJourneyComponent } from '../../../base-field/abstract-journey.component';
import { SearchLanguageInterpreterControlNames } from '../search-language-interpreter/search-language-interpreter-control-names.enum';

@Component({
  selector: 'ccd-select-flag-type',
  templateUrl: './select-flag-type.component.html',
  styleUrls: ['./select-flag-type.component.scss']
})
export class SelectFlagTypeComponent extends AbstractJourneyComponent implements OnInit, OnDestroy, Journey {
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

  @Input()
  public isDisplayContextParameter2Point1Enabled = false;

  @Input()
  public selectedFlagsLocation: FlagsWithFormGroupPath;

  @Output()
  public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  @Output()
  public flagCommentsOptionalEmitter: EventEmitter<any> = new EventEmitter();

  @Output()
  public flagTypeSubJourneyEmitter: EventEmitter<any> = new EventEmitter();

  public flagTypes: FlagType[];
  public errorMessages: ErrorMessage[];
  public flagTypeNotSelectedErrorMessage = '';
  public flagTypeErrorMessage = '';
  public flagRefdata$: Subscription;
  public refdataError = false;
  public cachedPath: (FlagType | false)[];
  public cachedFlagType: FlagType;
  public flagTypeControlChangesSubscription: Subscription;
  public caseFlagFormField = CaseFlagFormFields;
  public isCaseLevelFlag = false;
  public cachedRDFlagTypes: FlagType[];
  public subJourneyIndex: number = 0;

  private readonly maxCharactersForOtherFlagType = 80;
  // Code for "Other" flag type as defined in Reference Data
  private readonly otherFlagTypeCode = 'OT0001';
  private readonly caseLevelCaseFlagsFieldId = 'caseFlags';

  public get caseFlagWizardStepTitle(): typeof CaseFlagWizardStepTitle {
    return CaseFlagWizardStepTitle;
  }

  public constructor(private readonly caseFlagRefdataService: CaseFlagRefdataService, pageStateService: MultipageComponentStateService) {
    super(pageStateService);
    this.handleBackButtonSubJourney = this.handleBackButtonSubJourney.bind(this);
  }

  public get selectedFlagType(): FlagType | null {
    return this.formGroup.get(CaseFlagFormFields.FLAG_TYPE)?.value;
  }

  public get otherFlagTypeSelected(): boolean {
    return this.formGroup.get(CaseFlagFormFields.FLAG_TYPE)?.value?.flagCode === this.otherFlagTypeCode;
  }

  public ngOnInit(): void {
    this.isCaseLevelFlag = this.selectedFlagsLocation?.flags?.flagsCaseFieldId === this.caseLevelCaseFlagsFieldId;
    this.flagTypeSubJourneyEmitter.emit(this.subJourneyIndex);
    this.addState(this.subJourneyIndex);
    this.flagTypes = [];
    const flagType = this.isCaseLevelFlag ? RefdataCaseFlagType.CASE : RefdataCaseFlagType.PARTY;
    this.formGroup.addControl(CaseFlagFormFields.FLAG_TYPE, new FormControl(''));
    this.formGroup.addControl(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION, new FormControl(''));
    // FormControl is linked to a checkbox input element, so initial value should be false
    this.formGroup.addControl(CaseFlagFormFields.IS_VISIBLE_INTERNALLY_ONLY, new FormControl(false));

    // Should clear descriptionControlName if flagTypeControlName is changed
    this.flagTypeControlChangesSubscription = this.formGroup.get(CaseFlagFormFields.FLAG_TYPE)?.valueChanges
      .subscribe((_) => {
        this.formGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION)?.setValue('');
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
        .getCaseFlagsRefdata(this.hmctsServiceId, flagType, true, this.isDisplayContextParameterExternal)
        .subscribe({
          next: (flagTypes) => this.processFlagTypes(flagTypes),
          error: (error) => this.onRefdataError(error)
        });
    } else {
      // Else, HMCTS service code is required to retrieve the relevant list of flag types; attempt to obtain it by case type ID first
      this.flagRefdata$ = this.caseFlagRefdataService.getHmctsServiceDetailsByCaseType(this.caseTypeId)
        .pipe(
          // If an error occurs retrieving HMCTS service details by case type ID, try by service name instead
          catchError((_) => this.caseFlagRefdataService.getHmctsServiceDetailsByServiceName(this.jurisdiction)),
          // Use switchMap to return an inner Observable of the flag types data, having received the service details
          // including service_code. This avoids having nested `subscribe`s, which is an anti-pattern!
          switchMap((serviceDetails) => this.caseFlagRefdataService.getCaseFlagsRefdata(serviceDetails[0].service_code, flagType,
            true, this.isDisplayContextParameterExternal))
        )
        .subscribe({
          next: (flagTypes) => this.processFlagTypes(flagTypes),
          error: (error) => this.onRefdataError(error)
        });
    }
    this.addState(this.subJourneyIndex);
    window.addEventListener('popstate', this.handleBackButtonSubJourney);
  }

  public handleBackButtonSubJourney(event: Event): void {
    event.preventDefault();
    this.previous();
  }

  public addState(data: number, url?: string): void {
    history.pushState('1'+data, '', url);
  }

  public ngOnDestroy(): void {
    this.flagRefdata$?.unsubscribe();
    this.flagTypeControlChangesSubscription?.unsubscribe();
    // check if the user has an existing path when navigating away from the page
    // if so we may need to ensure the values are set correctly.
    this.checkForExistingPath();
    window.removeEventListener('popstate', this.handleBackButtonSubJourney);
  }

  public checkForExistingPath(): void {
    // Restore values from cachedPath
    if (this.subJourneyIndex <= 0) {
      // check if the user is navigating to the previous page in the jounrey.
      // in this situation we need to restore the full path for data retention across pages.
      if (this.cachedPath && this.cachedPath.length > 0) {
        this.cachedPath.forEach((flagType) => {
          if (flagType) {
            this.formGroup.get(CaseFlagFormFields.FLAG_TYPE)?.setValue(flagType, { emitEvent: false });
          }
        });
      }
    }
  }

  public onNext(): void {
    this.validateForm();
    this.emitCaseFlagState();
    this.emitFlagCommentsOptional();
    this.handleFlagTypeSelection();
    this.flagTypeSubJourneyEmitter.emit(this.subJourneyIndex);
    this.addState(this.subJourneyIndex);
  }

  private emitCaseFlagState(): void {
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE,
      isParentFlagType: this.selectedFlagType ? this.selectedFlagType.isParent : null,
      errorMessages: this.errorMessages
    });
  }

  private emitFlagCommentsOptional(): void {
    if (this.selectedFlagType && !this.selectedFlagType.isParent && !this.selectedFlagType.flagComment) {
      this.flagCommentsOptionalEmitter.emit(null);
    }
  }

  private handleFlagTypeSelection(): void {
    if (this.selectedFlagType?.isParent) {
      this.loadChildFlagTypes();
    } else {
      this.completeSubJourney();
    }
  }

  private loadChildFlagTypes(): void {
    this.cachedFlagType = this.selectedFlagType;
    this.flagTypes = this.selectedFlagType.childFlags;
    if (this.cachedPath.length !== 0 && this.cachedPath[this.subJourneyIndex] === this.selectedFlagType) {
      this.formGroup.get(CaseFlagFormFields.FLAG_TYPE)?.setValue(this.cachedPath[this.subJourneyIndex + 1], { emitEvent: false });
    } else {
      this.cachedPath?.shift();
      const value = this.cachedPath?.length ? this.cachedPath[0] : null;
      this.formGroup.get(CaseFlagFormFields.FLAG_TYPE)?.setValue(value, { emitEvent: false });
    }
    this.subJourneyIndex++;
  }

  private completeSubJourney(): void {
    const currentSelectedFlag = this.formGroup.controls.flagType;
    const addedFlagValue = this.selectedFlagsLocation?.caseField?.value?.details;
    if (addedFlagValue && (addedFlagValue[Object.keys(addedFlagValue).length]?.name !== currentSelectedFlag.value.name)) {
      this.selectedFlagsLocation['caseField'].value.details.pop();
      this.selectedFlagsLocation['caseField'].formatted_value?.details.pop();
    }
  }

  // Simplified version of the onPrevious method with optimized code
  public onPrevious(): void {
    if (this.cachedFlagType) {
      if (this.cachedFlagType.Path?.length === 1) {
        this.formGroup.get(CaseFlagFormFields.FLAG_TYPE)?.setValue(this.cachedFlagType, { emitEvent: false });
        this.flagTypes = this.cachedRDFlagTypes[0].childFlags;
      } else {
        let currentPath = this.cachedRDFlagTypes[0];
        const pathToSearch = this.cachedFlagType.Path.slice(1);
        for (const pathElement of pathToSearch) {
          const foundFlag = currentPath.childFlags.find((flag) => flag.name === pathElement);
          if (foundFlag) {
            currentPath = foundFlag;
          }
        }
        this.formGroup.get(CaseFlagFormFields.FLAG_TYPE)?.setValue(this.cachedFlagType, { emitEvent: false });
        this.flagTypes = currentPath.childFlags;
        this.cachedFlagType = currentPath;
      }
    }
    this.subJourneyIndex = Math.max(0, this.subJourneyIndex - 1);
    if (this.subJourneyIndex === 0) {
      this.flagTypes = this.flagTypes.filter((flag) =>
        this.isDisplayContextParameterExternal ? flag.flagCode !== this.otherFlagTypeCode : true);
    }
    this.flagTypeSubJourneyEmitter.emit(this.subJourneyIndex);
  }

  // Identity function for trackBy use by *ngFor for flagTypes in HTML template
  public identifyFlagType(_: number, flagType: FlagType): string {
    return `${flagType.flagCode}_${flagType.name}_${flagType.name_cy}`;
  }

  private validateForm(): void {
    this.flagTypeNotSelectedErrorMessage = '';
    this.flagTypeErrorMessage = '';
    this.errorMessages = [];

    if (!this.selectedFlagType) {
      // If there is any prior flag type selection then the message will differ
      let errorMessage = '';
      if (this.cachedFlagType) {
        errorMessage = SelectFlagTypeErrorMessage.FLAG_TYPE_OPTION_NOT_SELECTED;
      } else {
        errorMessage = this.isDisplayContextParameterExternal
          ? SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_SELECTED_EXTERNAL
          : SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_SELECTED;
      }
      this.flagTypeNotSelectedErrorMessage = errorMessage;
      this.errorMessages.push({ title: '', description: errorMessage, fieldId: 'conditional-radios-list' });
    }
    if (this.otherFlagTypeSelected) {
      const otherFlagTypeDescription = this.formGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION)?.value;
      if (!otherFlagTypeDescription) {
        this.flagTypeErrorMessage = this.isDisplayContextParameterExternal
          ? SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_ENTERED_EXTERNAL
          : SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_ENTERED;
        this.errorMessages.push({ title: '', description: `${this.flagTypeErrorMessage}`, fieldId: 'other-flag-type-description' });
      }
      if (otherFlagTypeDescription.length > this.maxCharactersForOtherFlagType) {
        this.flagTypeErrorMessage = SelectFlagTypeErrorMessage.FLAG_TYPE_LIMIT_EXCEEDED;
        this.errorMessages.push({ title: '', description: `${SelectFlagTypeErrorMessage.FLAG_TYPE_LIMIT_EXCEEDED}`, fieldId: 'other-flag-type-description' });
      }
    }
  }

  public processFlagTypes(flagTypes: FlagType[]): void {
    const prevJourneyPage = this.multipageComponentStateService.getJourneyCollection()[0];
    const { journeyPreviousPageNumber, journeyPageNumber } = prevJourneyPage;
    this.cachedRDFlagTypes = flagTypes;
    if (this.selectedFlagType && (journeyPreviousPageNumber > journeyPageNumber)) {
      const selectedFlagType = this.selectedFlagType;
      const pathToSearch = selectedFlagType.Path.slice(1);
      let currentPath = flagTypes[0];
      for (const pathElement of pathToSearch) {
        const foundFlag = currentPath.childFlags.find((flag) => flag.name === pathElement);
        if (foundFlag) {
          currentPath = foundFlag;
        }
      }
      this.flagTypes = currentPath.childFlags;
      this.cachedFlagType = currentPath;
    } else {
      this.flagTypes = flagTypes[0].childFlags.filter((flag) =>
        this.isDisplayContextParameterExternal ? flag.flagCode !== this.otherFlagTypeCode : true);
    }
    const formControl = this.formGroup.get(CaseFlagFormFields.FLAG_TYPE);
    if (formControl?.value) {
      const [foundFlagType, path] = FlagType.searchPathByFlagTypeObject(formControl.value as FlagType, this.cachedRDFlagTypes[0].childFlags);
      this.cachedPath = [...path, foundFlagType];
      formControl.setValue((this.selectedFlagType && (journeyPreviousPageNumber > journeyPageNumber)) ? this.cachedPath[this.cachedPath.length - 1] : this.cachedPath[0], { emitEvent: false });
      if (this.cachedPath.length !== 0 && (journeyPreviousPageNumber > journeyPageNumber)) {
        this.subJourneyIndex = this.cachedPath.length-1;
      }
    }
    this.flagTypeSubJourneyEmitter.emit(this.subJourneyIndex);
    this.addState(this.subJourneyIndex);
  }

  private onRefdataError(error: any): void {
    // Set error flag on component to remove the "Next" button (user cannot proceed with flag creation)
    this.refdataError = true;
    this.errorMessages = [];
    this.errorMessages.push({ title: '', description: error.message, fieldId: 'conditional-radios-list' });
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE, errorMessages: this.errorMessages });
  }

  public next(): void {
    this.onNext();
    this.addState(this.subJourneyIndex);
    if (this.errorMessages.length === 0) {
      super.next();
    }
  }

  public previous(): void {
    this.onPrevious();

    if (this.subJourneyIndex <= 0) {
      super.previous();
    }
  }
}
