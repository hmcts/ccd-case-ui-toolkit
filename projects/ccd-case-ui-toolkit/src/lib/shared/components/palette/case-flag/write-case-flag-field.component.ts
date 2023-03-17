import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CaseEditDataService } from '../../../commons/case-edit-data/case-edit-data.service';
import { CaseField, ErrorMessage } from '../../../domain';
import { FlagType } from '../../../domain/case-flag';
import { FieldsUtils } from '../../../services/fields';
import { CaseFlagStateService } from '../../case-editor/services/case-flag-state.service';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { CaseFlagState, FlagDetail, FlagDetailDisplayWithFormGroupPath, FlagsWithFormGroupPath } from './domain';
import { CaseFlagFieldState, CaseFlagFormFields, CaseFlagStatus, CaseFlagText } from './enums';

@Component({
  selector: 'ccd-write-case-flag-field',
  templateUrl: './write-case-flag-field.component.html',
  styleUrls: ['./write-case-flag-field.component.scss']
})
export class WriteCaseFlagFieldComponent extends AbstractFieldWriteComponent implements OnInit, OnDestroy {
  public formGroup: FormGroup;
  public fieldState: number;
  public caseFlagFieldState = CaseFlagFieldState;
  public errorMessages: ErrorMessage[] = [];
  public createFlagCaption: CaseFlagText;
  public flagsData: FlagsWithFormGroupPath[];
  public selectedFlag: FlagDetailDisplayWithFormGroupPath;
  public caseFlagParentFormGroup: FormGroup;
  public flagCommentsOptional = false;
  public jurisdiction: string;
  public isDisplayContextParameterUpdate: boolean;
  public isDisplayContextParameterExternal: boolean;
  public caseTitle: string;
  public caseTitleSubscription: Subscription;
  public displayContextParameter: string;
  private allCaseFlagStagesCompleted = false;
  private readonly updateMode = '#ARGUMENT(UPDATE)';
  private readonly updateExternalMode = '#ARGUMENT(UPDATE,EXTERNAL)';
  private readonly createMode = '#ARGUMENT(CREATE)';
  private readonly createExternalMode = '#ARGUMENT(CREATE,EXTERNAL)';
  // Code for "Other" flag type as defined in Reference Data
  private readonly otherFlagTypeCode = 'OT0001';
  public readonly caseNameMissing = 'Case name missing';

  public get flagType(): FlagType | null {
    return this.caseFlagParentFormGroup?.value.flagType;
  }

  public get selectedFlagsLocation(): FlagsWithFormGroupPath | null {
    return this.caseFlagParentFormGroup?.value.selectedLocation;
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly caseEditDataService: CaseEditDataService,
    private readonly location: Location,
    private readonly caseFlagStateService: CaseFlagStateService
  ) {
    super();
  }

  public ngOnInit(): void {
    if (!(this.location.getState()?.['fieldState'] >= 0)) {
      const params = this.route.snapshot.params;
      this.caseFlagStateService.resetCache(`../${params['eid']}/${params['page']}`);
    }
    this.caseFlagParentFormGroup = this.caseFlagStateService.formGroup;

    this.caseEditDataService.clearFormValidationErrors();
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

    // Get the jurisdiction from the CaseView object in the snapshot data (required for retrieving the available flag
    // types for a case)
    if (this.route.snapshot.data.case && this.route.snapshot.data.case.case_type &&
      this.route.snapshot.data.case.case_type.jurisdiction) {
      this.jurisdiction = this.route.snapshot.data.case.case_type.jurisdiction.id;
    }
    // Extract all flags-related data from the CaseEventTrigger object in the snapshot data
    if (this.route.snapshot.data.eventTrigger && this.route.snapshot.data.eventTrigger.case_fields) {
      this.flagsData = (this.route.snapshot.data.eventTrigger.case_fields as CaseField[])
        .reduce((flags, caseField) => {
          return FieldsUtils.extractFlagsDataFromCaseField(flags, caseField, caseField.id, caseField);
        }, []);

      // Set displayContextParameter (to be passed as an input to ManageCaseFlagsComponent for setting correct title)
      this.displayContextParameter =
        this.setDisplayContextParameter(this.route.snapshot.data.eventTrigger.case_fields as CaseField[]);

      // Set boolean indicating the display_context_parameter is "update"
      this.isDisplayContextParameterUpdate = this.setDisplayContextParameterUpdate(this.displayContextParameter);

      // Set boolean indicating the display_context_parameter is "external"
      this.isDisplayContextParameterExternal = this.setDisplayContextParameterExternal(this.displayContextParameter);

      // Set starting field state if fieldState not the right value
      if (!(this.location.getState()?.['fieldState'] >= 0)) {
        this.fieldState = this.isDisplayContextParameterUpdate ? CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS : CaseFlagFieldState.FLAG_LOCATION;
      } else {
        this.fieldState = this.location.getState()['fieldState'];
      }

      // Set Create Case Flag component title caption text (appearing above child component <h1> title)
      this.createFlagCaption = this.setCreateFlagCaption(this.displayContextParameter);

      // Get case title, to be used by child components
      this.caseTitleSubscription = this.caseEditDataService.caseTitle$.subscribe({
        next: title => {
          this.caseTitle = title?.length > 0 ? title : this.caseNameMissing;
        }
      });
    }
  }

  public setDisplayContextParameterUpdate(displayContextParameter: string): boolean {
    return displayContextParameter === this.updateMode || displayContextParameter === this.updateExternalMode;
  }

  public setDisplayContextParameterExternal(displayContextParameter: string): boolean {
    return displayContextParameter === this.createExternalMode || displayContextParameter === this.updateExternalMode;
  }

  public onCaseFlagStateEmitted(caseFlagState: CaseFlagState): void {
    this.caseEditDataService.clearFormValidationErrors();

    this.errorMessages = caseFlagState.errorMessages;
    this.selectedFlag = caseFlagState.selectedFlag;

    // Validation succeeded; proceed to next state or final review stage ("Check your answers")
    if (this.errorMessages.length === 0) {
      // If the current state is CaseFlagFieldState.FLAG_STATUS or CaseFlagFieldState.FLAG_UPDATE, move to final
      // review stage
      // First condition is for create case flag; Second condition is for the manage flag case journey
      if (caseFlagState.currentCaseFlagFieldState === CaseFlagFieldState.FLAG_STATUS ||
          ( caseFlagState.currentCaseFlagFieldState === CaseFlagFieldState.FLAG_UPDATE
              && !this.caseFlagParentFormGroup.get(CaseFlagFormFields.IS_WELSH_TRANSLATION_NEEDED)?.value ||
            caseFlagState.currentCaseFlagFieldState === CaseFlagFieldState.FLAG_UPDATE_WELSH_TRANSLATION
          )
      ) {
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
      if (this.fieldState === CaseFlagFieldState.FLAG_TYPE && !this.flagType?.listOfValues) {
        this.fieldState = CaseFlagFieldState.FLAG_COMMENTS;
      } else {
        this.fieldState++;
      }
    }
  }

  public setFlagsCaseFieldValue(): void {
    // tslint:disable-next-line: switch-default
    switch (this.fieldState) {
      case CaseFlagFieldState.FLAG_STATUS:
        this.addFlagToCollection();
        break;
      case this.manageFlagFinalState:
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

    const path = this.selectedFlagsLocation.pathToFlagsFormGroup;
    const flagDataRef = this.flagsData.find(item => item.pathToFlagsFormGroup === path);
    let flagsCaseFieldValue = flagDataRef.caseField.value;
    // Use the pathToFlagsFormGroup property from the selected flag location to drill down to the correct part of the
    // CaseField value to apply changes to
    // Root-level Flags CaseFields don't have a dot-delimited path - just the CaseField ID itself - so don't drill down
    if (path.indexOf('.') > -1) {
      path.slice(path.indexOf('.') + 1).split('.').forEach(part => flagsCaseFieldValue = flagsCaseFieldValue[part]);
    }
    // If the CaseField for the selected flags location has no value, set it to an empty object so it can be populated
    // with flag details
    if (!flagsCaseFieldValue) {
      flagDataRef.caseField.value = {};
      flagsCaseFieldValue = flagDataRef.caseField.value;
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
    // the description, comments, status, and date/time modified (if present) for each entry in the details array, with
    // original values from the corresponding formatted_value property. (This scenario occurs if the user repeats the
    // Manage Case Flag journey by using the "Change" link and selects a different flag to update.)
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
            flagDetail.value.otherDescription = originalFlagDetail.value.otherDescription
              ? originalFlagDetail.value.otherDescription
              : null;
            flagDetail.value.otherDescription_cy = originalFlagDetail.value.otherDescription_cy
              ? originalFlagDetail.value.otherDescription_cy
              : null;
            flagDetail.value.flagComment = originalFlagDetail.value.flagComment
              ? originalFlagDetail.value.flagComment
              : null;
            flagDetail.value.flagComment_cy = originalFlagDetail.value.flagComment_cy
              ? originalFlagDetail.value.flagComment_cy
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
        // Update description fields only if flag type is "Other" (flag code OT0001); these fields apply only to that flag type
        flagDetailToUpdate.value.otherDescription = flagDetailToUpdate.value.flagCode === this.otherFlagTypeCode
          ? this.caseFlagParentFormGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION)?.value
          : null,
        flagDetailToUpdate.value.otherDescription_cy = flagDetailToUpdate.value.flagCode === this.otherFlagTypeCode
          ? this.caseFlagParentFormGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH)?.value
          : null,
        flagDetailToUpdate.value.flagComment = this.caseFlagParentFormGroup.get(CaseFlagFormFields.COMMENTS)?.value;
        flagDetailToUpdate.value.flagComment_cy = this.caseFlagParentFormGroup.get(CaseFlagFormFields.COMMENTS_WELSH)?.value;
        flagDetailToUpdate.value.status = CaseFlagStatus[this.caseFlagParentFormGroup.get(CaseFlagFormFields.STATUS)?.value];
        flagDetailToUpdate.value.dateTimeModified = new Date().toISOString();
      }
    }
  }

  public isAtFinalState(): boolean {
    return this.isDisplayContextParameterUpdate
      ? this.fieldState === this.manageFlagFinalState
      : this.fieldState === CaseFlagFieldState.FLAG_STATUS;
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

  public populateNewFlagDetailInstance(): FlagDetail {
    const formValues = this.caseFlagParentFormGroup?.value;
    return {
      name: formValues?.flagType?.name,
      name_cy: formValues?.flagType?.name_cy,
      // Currently, subTypeValue and subTypeKey are applicable only to language flag types
      subTypeValue: formValues?.languageSearchTerm
        ? formValues?.languageSearchTerm.value
        : formValues?.manualLanguageEntry
          ? formValues?.manualLanguageEntry
          : null,
      // For user-entered (i.e. non-Reference Data) languages, there is no key
      subTypeKey: formValues?.languageSearchTerm
        ? formValues?.languageSearchTerm.key
        : null,
      otherDescription: formValues?.flagType?.flagCode === this.otherFlagTypeCode &&
        formValues?.otherDescription
        ? formValues?.otherDescription
        : null,
      flagComment: formValues?.flagComments,
      flagUpdateComment: formValues?.statusReason,
      dateTimeCreated: new Date().toISOString(),
      path: formValues?.flagType?.Path &&
        formValues?.flagType?.Path.map(pathValue => Object.assign({ id: null, value: pathValue })),
      hearingRelevant: formValues?.flagType?.hearingRelevantFlag ? 'Yes' : 'No',
      flagCode: formValues?.flagType?.flagCode,
      status: CaseFlagStatus[formValues?.selectedStatus],
      availableExternally: formValues?.flagType?.externallyAvailable ? 'Yes' : 'No'
    } as FlagDetail;
  }

  public moveToFinalReviewStage(): void {
    this.setFlagsCaseFieldValue();
    // Clear the "notAllCaseFlagStagesCompleted" error
    this.allCaseFlagStagesCompleted = true;
    this.formGroup.updateValueAndValidity();
    this.caseEditDataService.setTriggerSubmitEvent(true);
  }

  public ngOnDestroy(): void {
    this.caseTitleSubscription?.unsubscribe();
  }

  public get manageFlagFinalState() {
    return this.caseFlagParentFormGroup.get(CaseFlagFormFields.IS_WELSH_TRANSLATION_NEEDED)?.value
    ? CaseFlagFieldState.FLAG_UPDATE_WELSH_TRANSLATION : CaseFlagFieldState.FLAG_UPDATE;
  }

  public setDisplayContextParameter(caseFields: CaseField[]): string {
    return caseFields.find(caseField => FieldsUtils.isFlagLauncherCaseField(caseField))?.display_context_parameter;
  }

  public setCreateFlagCaption(displayContextParameter: string): CaseFlagText {
    switch (displayContextParameter) {
      case this.createMode:
        return CaseFlagText.CAPTION_INTERNAL;
      case this.createExternalMode:
        return CaseFlagText.CAPTION_EXTERNAL;
      default:
        return CaseFlagText.CAPTION_NONE;
    }
  }
}
