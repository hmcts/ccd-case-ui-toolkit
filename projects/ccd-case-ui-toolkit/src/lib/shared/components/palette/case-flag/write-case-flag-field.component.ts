import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CaseEditDataService } from '../../../commons/case-edit-data/case-edit-data.service';
import { CaseField, ErrorMessage } from '../../../domain';
import { FieldsUtils } from '../../../services/fields';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { CaseFlagState, FlagDetail, FlagDetailDisplayWithFormGroupPath, FlagPath, FlagsWithFormGroupPath } from './domain';
import { CaseFlagFieldState, CaseFlagStatus, CaseFlagText } from './enums';

@Component({
  selector: 'ccd-write-case-flag-field',
  templateUrl: './write-case-flag-field.component.html',
  styleUrls: ['./write-case-flag-field.component.scss']
})
export class WriteCaseFlagFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  public formGroup: FormGroup;
  public fieldState: number;
  public caseFlagFieldState = CaseFlagFieldState;
  public errorMessages: ErrorMessage[] = [];
  public createFlagCaption: CaseFlagText;
  public flagsData: FlagsWithFormGroupPath[];
  public selectedFlag: FlagDetailDisplayWithFormGroupPath;
  public selectedFlagsLocation: FlagsWithFormGroupPath;
  public caseFlagParentFormGroup = new FormGroup({});
  public flagCommentsOptional = false;
  public jurisdiction: string;
  public flagName: string;
  public flagPath: FlagPath[];
  public hearingRelevantFlag: boolean;
  public flagCode: string;
  public listOfValues: {key: string, value: string}[] = null;
  public isDisplayContextParameterUpdate: boolean;
  public caseTitle: string;
  private allCaseFlagStagesCompleted = false;
  private readonly updateMode = '#ARGUMENT(UPDATE)';
  // Code for "Other" flag type as defined in Reference Data
  private readonly otherFlagTypeCode = 'OT0001';
  public readonly caseNameMissing = 'Case name missing';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly caseEditDataService: CaseEditDataService
  ) {
    super();
  }

  public ngOnInit(): void {
    // Check for existing FlagLauncher control in parent and remove it - this is the only way to ensure its invalidity
    // is set correctly at the start, when the component is reloaded and the control is re-registered. Otherwise, the
    // validator state gets carried over
    if (this.formGroup && this.formGroup.get(this.caseField.id)) {
      this.formGroup.removeControl(this.caseField.id);
    }
    // From this point, this.formGroup refers to the FormGroup for the FlagLauncher field, not the parent FormGroup
    this.formGroup = this.registerControl(new FormGroup({}, {
      validators: (_: AbstractControl): {[key: string]: boolean} | null => {
        if (!this.allCaseFlagStagesCompleted) {
          // Return an error to mark the FormGroup as invalid if not all Case Flag stages have been completed
          return {notAllCaseFlagStagesCompleted: true};
        }
        return null;
      }
    }), true) as FormGroup;

    this.createFlagCaption = CaseFlagText.CAPTION;
    // Get the jurisdiction from the CaseView object in the snapshot data (required for retrieving the available flag
    // types for a case)
    if (this.route.snapshot.data.case && this.route.snapshot.data.case.case_type &&
      this.route.snapshot.data.case.case_type.jurisdiction) {
      this.jurisdiction = this.route.snapshot.data.case.case_type.jurisdiction.id;
    }
    // Extract all flags-related data from the CaseEventTrigger object in the snapshot data
    if (this.route.snapshot.data.eventTrigger && this.route.snapshot.data.eventTrigger.case_fields) {
      this.flagsData = ((this.route.snapshot.data.eventTrigger.case_fields) as CaseField[])
        .reduce((flags, caseField) => {
          return FieldsUtils.extractFlagsDataFromCaseField(flags, caseField, caseField.id, caseField);
        }, []);

      // Set boolean indicating the display_context_parameter is "update"
      this.isDisplayContextParameterUpdate =
        this.setDisplayContextParameterUpdate((this.route.snapshot.data.eventTrigger.case_fields) as CaseField[]);

      // Set starting field state
      this.fieldState = this.isDisplayContextParameterUpdate ? CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS : CaseFlagFieldState.FLAG_LOCATION;
      // Get case title, to be used by child components
      this.caseEditDataService.caseTitle$.subscribe({
        next: title => {
          this.caseTitle = title.length > 0 ? title : this.caseNameMissing;
        }
      });
    }
  }

  public setDisplayContextParameterUpdate(caseFields: CaseField[]): boolean {
    return caseFields.some(
      caseField => FieldsUtils.isFlagLauncherCaseField(caseField) && caseField.display_context_parameter === this.updateMode);
  }

  public onCaseFlagStateEmitted(caseFlagState: CaseFlagState): void {
    // If the current state is CaseFlagFieldState.FLAG_LOCATION and a flag location (a Flags instance) has been selected,
    // set the parent Case Flag FormGroup for this component's children by using the provided pathToFlagsFormGroup, and
    // set the selected flag location on this component
    if (caseFlagState.currentCaseFlagFieldState === CaseFlagFieldState.FLAG_LOCATION
      && caseFlagState.selectedFlagsLocation
      && caseFlagState.selectedFlagsLocation.pathToFlagsFormGroup) {
      this.setCaseFlagParentFormGroup(caseFlagState.selectedFlagsLocation.pathToFlagsFormGroup);
      this.selectedFlagsLocation = caseFlagState.selectedFlagsLocation;
    }
    // If the current state is CaseFlagFieldState.FLAG_TYPE, cache the flag name, path, hearing relevant indicator, code,
    // and "list of values" (currently applicable to language flag types)
    if (caseFlagState.currentCaseFlagFieldState === CaseFlagFieldState.FLAG_TYPE) {
      this.flagName = caseFlagState.flagName;
      this.flagPath = caseFlagState.flagPath;
      this.hearingRelevantFlag = caseFlagState.hearingRelevantFlag;
      this.flagCode = caseFlagState.flagCode;
      this.listOfValues = caseFlagState.listOfValues;
    }
    // If the current state is CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS and a flag has been selected, set the parent
    // Case Flag FormGroup for this component's children by using the provided pathToFlagsFormGroup
    if (caseFlagState.currentCaseFlagFieldState === CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS
      && caseFlagState.selectedFlag
      && caseFlagState.selectedFlag.pathToFlagsFormGroup) {
      this.setCaseFlagParentFormGroup(caseFlagState.selectedFlag.pathToFlagsFormGroup);
    }


    this.errorMessages = caseFlagState.errorMessages;
    this.selectedFlag = caseFlagState.selectedFlag;
    // Validation succeeded; proceed to next state or final review stage ("Check your answers")
    if (this.errorMessages.length === 0) {
      // If the current state is CaseFlagFieldState.FLAG_COMMENTS or CaseFlagFieldState.FLAG_UPDATE, move to final
      // review stage
      if (caseFlagState.currentCaseFlagFieldState === CaseFlagFieldState.FLAG_COMMENTS ||
          caseFlagState.currentCaseFlagFieldState === CaseFlagFieldState.FLAG_UPDATE) {
        this.moveToFinalReviewStage();
        // Don't move to next state if current state is CaseFlagFieldState.FLAG_TYPE and the flag type is a parent - this
        // means the user needs to select from the next set of flag types before they can move on
      } else if (!caseFlagState.isParentFlagType) {
        // Proceed to next state
        this.proceedToNextState();
      }
    }
  }

  public proceedToNextState(): void {
    if (!this.isAtFinalState()) {
      // Skip the "language interpreter" state if current state is CaseFlagFieldState.FLAG_TYPE and the flag type doesn't
      // have a "list of values" - currently, this is present only for those flag types that require language interpreter
      // selection
      if (this.fieldState === CaseFlagFieldState.FLAG_TYPE && !this.listOfValues) {
        this.fieldState = CaseFlagFieldState.FLAG_COMMENTS;
      } else {
        this.fieldState++;
      }
    }
  }

  public setFlagsCaseFieldValue(): void {
    // tslint:disable-next-line: switch-default
    switch (this.fieldState) {
      case CaseFlagFieldState.FLAG_COMMENTS:
        this.addFlagToCollection();
        break;
      case CaseFlagFieldState.FLAG_UPDATE:
        this.updateFlagInCollection();
        break;
    }
  }

  public addFlagToCollection(): void {
    // Ensure no more than one new flag is being added at a time, by iterating through each Flags case field and removing
    // any previous entry from the details array where that entry has no id (hence it is new - and there should be only
    // one such entry). (This scenario occurs if the user repeats the Case Flag creation journey by using the "Change"
    // link and selects either the same flag location as before or a different one.)
    this.flagsData.forEach(instance => {
      // Use the pathToFlagsFormGroup property for each Flags case field to drill down to the correct part of the
      // CaseField value to remove the new value from
      let value = instance.caseField.value;
      const pathToValue = instance.pathToFlagsFormGroup;
      // Root-level Flags CaseFields don't have a dot-delimited path - just the CaseField ID itself - so don't drill down
      if (pathToValue.indexOf('.') > -1) {
        pathToValue.slice(pathToValue.indexOf('.') + 1).split('.').forEach(part => value = value[part]);
      }
      if (value && value.details && value.details.length > 0) {
        const indexOfNewFlagDetail = value.details.findIndex(element => !element.hasOwnProperty('id'));
        if (indexOfNewFlagDetail > -1) {
          value.details.splice(indexOfNewFlagDetail, 1);
        }
      }
    });
    let flagsCaseFieldValue = this.selectedFlagsLocation.caseField.value;
    // Use the pathToFlagsFormGroup property from the selected flag location to drill down to the correct part of the
    // CaseField value to apply changes to
    const path = this.selectedFlagsLocation.pathToFlagsFormGroup;
    // Root-level Flags CaseFields don't have a dot-delimited path - just the CaseField ID itself - so don't drill down
    if (path.indexOf('.') > -1) {
      path.slice(path.indexOf('.') + 1).split('.').forEach(part => flagsCaseFieldValue = flagsCaseFieldValue[part]);
    }
    // If the CaseField for the selected flags location has no value, set it to an empty object so it can be populated
    // with flag details
    if (!flagsCaseFieldValue) {
      this.selectedFlagsLocation.caseField.value = {};
      flagsCaseFieldValue = this.selectedFlagsLocation.caseField.value;
    }
    // Create a details array if one does not exist
    if (!flagsCaseFieldValue.hasOwnProperty('details')) {
      flagsCaseFieldValue.details = [];
    }
    // Populate new FlagDetail instance and add to the Flags data within the CaseField instance of the selected flag
    // location
    flagsCaseFieldValue.details.push({value: this.populateNewFlagDetailInstance()});
  }

  public updateFlagInCollection(): void {
    // Ensure no more than one flag is being updated at a time, by iterating through each Flags case field and resetting
    // the comments, status, and date/time modified (if present) for each entry in the details array, with original values
    // from the corresponding formatted_value property. (This scenario occurs if the user repeats the Manage Case Flag
    // journey by using the "Change" link and selects a different flag to update.)
    this.flagsData.forEach(instance => {
      // Use the pathToFlagsFormGroup property for each Flags case field to drill down to the correct part of the
      // CaseField value for which to restore the original values
      let value = instance.caseField.value;
      let formattedValue = instance.caseField.formatted_value;
      const pathToValue = instance.pathToFlagsFormGroup;
      // Root-level Flags CaseFields don't have a dot-delimited path - just the CaseField ID itself - so don't drill down
      if (pathToValue.indexOf('.') > -1) {
        pathToValue.slice(pathToValue.indexOf('.') + 1).split('.').forEach(part => {
          value = value[part];
          if (formattedValue && FieldsUtils.isNonEmptyObject(formattedValue)) {
            formattedValue = formattedValue[part];
          }
        });
      }
      if (value && value.details && value.details.length > 0 && formattedValue && FieldsUtils.isNonEmptyObject(formattedValue)) {
        value.details.forEach(flagDetail => {
          const originalFlagDetail = formattedValue.details.find(detail => detail.id === flagDetail.id);
          if (originalFlagDetail) {
            flagDetail.value.flagComment = originalFlagDetail.value.flagComment
              ? originalFlagDetail.value.flagComment
              : null;
            flagDetail.value.status = originalFlagDetail.value.status;
            flagDetail.value.dateTimeModified = originalFlagDetail.value.dateTimeModified
              ? originalFlagDetail.value.dateTimeModified
              : null;
          }
        });
      }
    });
    let flagsCaseFieldValue = this.selectedFlag.caseField.value;
    // Use the pathToFlagsFormGroup property from the selected flag location to drill down to the correct part of the
    // CaseField value to apply changes to
    const path = this.selectedFlag.pathToFlagsFormGroup;
    // Root-level Flags CaseFields don't have a dot-delimited path - just the CaseField ID itself - so don't drill down
    if (path.indexOf('.') > -1) {
      path.slice(path.indexOf('.') + 1).split('.').forEach(part => flagsCaseFieldValue = flagsCaseFieldValue[part]);
    }
    if (flagsCaseFieldValue) {
      const flagDetailToUpdate = flagsCaseFieldValue.details.find(
        detail => detail.id === this.selectedFlag.flagDetailDisplay.flagDetail.id);
      if (flagDetailToUpdate) {
        flagDetailToUpdate.value.flagComment = this.caseFlagParentFormGroup.value.flagComments
          ? this.caseFlagParentFormGroup.value.flagComments
          : null;
        flagDetailToUpdate.value.status = this.selectedFlag.flagDetailDisplay.flagDetail.status;
        flagDetailToUpdate.value.dateTimeModified = new Date().toISOString();
      }
    }
  }

  public isAtFinalState(): boolean {
    return this.isDisplayContextParameterUpdate
      ? this.fieldState === CaseFlagFieldState.FLAG_UPDATE
      : this.fieldState === CaseFlagFieldState.FLAG_COMMENTS;
  }

  public navigateToErrorElement(elementId: string): void {
    if (elementId) {
      const htmlElement = document.getElementById(elementId);
      if (htmlElement) {
        htmlElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        htmlElement.focus();
      }
    }
  }

  public onFlagCommentsOptionalEmitted(_: any): void {
    this.flagCommentsOptional = true;
  }

  /**
   * Set the parent {@link FormGroup} for this component's children, depending on the `Flags` {@link CaseField} instance
   * to which data should be attached. **Note:** The parent is not _this_ component's `FormGroup` (as might otherwise be
   * expected) because this component is not expected to have a value, given it is used for the empty `FlagLauncher` base
   * field type.
   *
   * @param pathToFlagsFormGroup The dot-delimited string that is the path to the `FormGroup` for a `Flags` instance
   */
  public setCaseFlagParentFormGroup(pathToFlagsFormGroup: string): void {
    this.caseFlagParentFormGroup = this.formGroup.parent.get(pathToFlagsFormGroup) as FormGroup;
  }

  public populateNewFlagDetailInstance(): FlagDetail {
    return {
      name: this.flagName,
      // Currently, subTypeValue and subTypeKey are applicable only to language flag types
      subTypeValue: this.caseFlagParentFormGroup.value.languageSearchTerm
        ? this.caseFlagParentFormGroup.value.languageSearchTerm.value
        : this.caseFlagParentFormGroup.value.manualLanguageEntry
          ? this.caseFlagParentFormGroup.value.manualLanguageEntry
          : null,
      // For user-entered (i.e. non-Reference Data) languages, there is no key
      subTypeKey: this.caseFlagParentFormGroup.value.languageSearchTerm
        ? this.caseFlagParentFormGroup.value.languageSearchTerm.key
        : null,
      otherDescription: this.flagCode === this.otherFlagTypeCode && this.caseFlagParentFormGroup.value.otherFlagTypeDescription
        ? this.caseFlagParentFormGroup.value.otherFlagTypeDescription
        : null,
      flagComment: this.caseFlagParentFormGroup.value.flagComments ? this.caseFlagParentFormGroup.value.flagComments : null,
      dateTimeCreated: new Date().toISOString(),
      path: this.flagPath,
      hearingRelevant: this.hearingRelevantFlag ? 'Yes' : 'No',
      flagCode: this.flagCode,
      status: CaseFlagStatus.ACTIVE
    } as FlagDetail;
  }

  public moveToFinalReviewStage(): void {
    this.setFlagsCaseFieldValue();
    // Clear the "notAllCaseFlagStagesCompleted" error
    this.allCaseFlagStagesCompleted = true;
    this.formGroup.updateValueAndValidity();
    this.caseEditDataService.setTriggerSubmitEvent(true);
  }
}
