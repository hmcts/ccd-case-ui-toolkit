import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RpxTranslationService } from 'rpx-xui-translation';
import { Subscription } from 'rxjs';
import { CaseEditDataService } from '../../../commons/case-edit-data/case-edit-data.service';
import { CaseField, ErrorMessage, Journey } from '../../../domain';
import { FlagType } from '../../../domain/case-flag';
import { FieldsUtils } from '../../../services/fields';
import { CaseFlagState, FlagDetail, FlagDetailDisplayWithFormGroupPath, FlagsWithFormGroupPath } from './domain';
import { MultipageComponentStateService } from '../../../services';
import { AbstractFieldWriteJourneyComponent } from '../base-field/abstract-field-write-journey.component';
import { CaseFlagStateService } from '../../case-editor/services/case-flag-state.service';
import { CaseFlagDisplayContextParameter, CaseFlagErrorMessage, CaseFlagFieldState, CaseFlagFormFields, CaseFlagStatus } from './enums';

@Component({
  selector: 'ccd-write-case-flag-field',
  templateUrl: './write-case-flag-field.component.html',
  styleUrls: ['./write-case-flag-field.component.scss']
})
export class WriteCaseFlagFieldComponent extends AbstractFieldWriteJourneyComponent implements OnInit, OnDestroy, Journey {
  //public formGroup: FormGroup;
  public fieldState: number;
  public caseFlagFieldState = CaseFlagFieldState;
  public errorMessages: ErrorMessage[] = [];
  public flagsData: FlagsWithFormGroupPath[];
  public selectedFlag: FlagDetailDisplayWithFormGroupPath;
  public caseFlagParentFormGroup: FormGroup;
  public flagCommentsOptional = false;
  public jurisdiction: string;
  public caseTypeId: string;
  public hmctsServiceId: string;
  public isDisplayContextParameterUpdate: boolean;
  public isDisplayContextParameterExternal: boolean;
  public isDisplayContextParameter2Point1Enabled: boolean;
  public caseTitle: string;
  public caseTitleSubscription: Subscription;
  public displayContextParameter: string;
  public determinedLocation: FlagsWithFormGroupPath;
  private allCaseFlagStagesCompleted = false;
  // Code for "Other" flag type as defined in Reference Data
  private readonly otherFlagTypeCode = 'OT0001';
  private readonly selectedManageCaseLocation = 'selectedManageCaseLocation';
  public readonly caseNameMissing = 'Case name missing';

  public get flagType(): FlagType | null {
    return this.caseFlagParentFormGroup?.value.flagType;
  }

  public get selectedFlagsLocation(): FlagsWithFormGroupPath | null {
    return this.caseFlagParentFormGroup?.value.selectedLocation;
  }

  public set selectedFlagsLocation(selectedLocation: FlagsWithFormGroupPath | null) {
    if (this.caseFlagParentFormGroup) {
      this.caseFlagParentFormGroup.value.selectedLocation = selectedLocation;
    }
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly caseEditDataService: CaseEditDataService,
    private readonly caseFlagStateService: CaseFlagStateService,
    private readonly rpxTranslationService: RpxTranslationService,
    multipageComponentStateService: MultipageComponentStateService
  ) {
    super(multipageComponentStateService);
  }

  public ngOnInit(): void {
    let navigatedTo: boolean = false;

    // If it is start of the journey or navigation from check your answers page then fieldStateToNavigate property
    // in case flag state service will contain the field state to navigate based on create or manage journey
    this.fieldState = this.caseFlagStateService.fieldStateToNavigate;
    if (this.fieldState === undefined) {
      const params = this.route.snapshot.params;
      // Clear the form group, field state to navigate and set the page location
      this.caseFlagStateService.resetCache(`../${params['eid']}/${params['page']}`);
    } else {
      navigatedTo = true;
    }

    // Reassign the form group from the case flag state service
    this.caseFlagParentFormGroup = this.caseFlagStateService.formGroup;
    // Clear form validation errors as a new page will be rendered based on field state
    this.caseEditDataService.clearFormValidationErrors();
    // Check for existing FlagLauncher control in parent and remove it - this is the only way to ensure its invalidity
    // is set correctly at the start, when the component is reloaded and the control is re-registered. Otherwise, the
    // validator state gets carried over
    if (this.formGroup && this.formGroup.get(this.caseField.id)) {
      this.formGroup.removeControl(this.caseField.id);
    }
    // From this point, this.formGroup refers to the FormGroup for the FlagLauncher field, not the parent FormGroup
    this.formGroup = this.registerControl(new FormGroup({}, {
      validators: (_: AbstractControl): { [key: string]: boolean } | null => {
        if (!this.allCaseFlagStagesCompleted) {
          // Return an error to mark the FormGroup as invalid if not all Case Flag stages have been completed
          return { notAllCaseFlagStagesCompleted: true };
        }
        return null;
      }
    }), true) as FormGroup;

    // Get the case type ID from the CaseView object in the snapshot data (required for retrieving the available flag
    // types for a case)
    if (this.route.snapshot.data.case && this.route.snapshot.data.case.case_type) {
      this.caseTypeId = this.route.snapshot.data.case.case_type.id;
      // Get the jurisdiction (required for retrieving the available flag types if unable to determine using case type ID)
      if (this.route.snapshot.data.case.case_type.jurisdiction) {
        this.jurisdiction = this.route.snapshot.data.case.case_type.jurisdiction.id;
      }
    }
    // Extract all flags-related data from the CaseEventTrigger object in the snapshot data
    if (this.route.snapshot.data.eventTrigger) {
      // Get the HMCTSServiceId from supplementary data, if it exists (required for retrieving the available flag types in
      // the first instance, only falling back on case type ID or jurisdiction if it's not present)
      if (this.route.snapshot.data.eventTrigger.supplementary_data
        && this.route.snapshot.data.eventTrigger.supplementary_data.HMCTSServiceId) {
        this.hmctsServiceId = this.route.snapshot.data.eventTrigger.supplementary_data.HMCTSServiceId;
      }

      if (this.route.snapshot.data.eventTrigger.case_fields) {
        this.flagsData = ((this.route.snapshot.data.eventTrigger.case_fields) as CaseField[])
          .reduce((flags, caseField) => FieldsUtils.extractFlagsDataFromCaseField(flags, caseField, caseField.id, caseField), []);

        // Set displayContextParameter (to be passed as an input to ManageCaseFlagsComponent for setting correct title)
        this.displayContextParameter =
          this.setDisplayContextParameter(this.route.snapshot.data.eventTrigger.case_fields as CaseField[]);

        // Set boolean indicating the display_context_parameter is "update"
        this.isDisplayContextParameterUpdate = this.setDisplayContextParameterUpdate(this.displayContextParameter);

        // Set boolean indicating the display_context_parameter is "external"
        this.isDisplayContextParameterExternal = this.setDisplayContextParameterExternal(this.displayContextParameter);

        // Set boolean indicating the display_context_parameter is Case Flags v2.1 enabled
        this.isDisplayContextParameter2Point1Enabled = this.setDisplayContextParameter2Point1Enabled(this.displayContextParameter);

        // Set starting field state if fieldState not the right value
        if (!this.fieldState) {
          this.fieldState = this.isDisplayContextParameterUpdate ? CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS : CaseFlagFieldState.FLAG_LOCATION;
        }

        // Get case title, to be used by child components
        this.caseTitleSubscription = this.caseEditDataService.caseTitle$.subscribe({
          next: title => {
            this.caseTitle = title?.length > 0 ? title : this.caseNameMissing;
          }
        });
      }
    }

    // CSFD-16.
    // Setup the page number to initially be the same value as 
    // the start page number. Provided that some state exists within 
    // the page state service, use that instaead.
    //
    // If isDisplayContextParameterUpdate is true, then the starting page must be 
    // the value of 4. Otherwise, it's 0. However, we're using an enum to simplify
    // this process.
    //
    // It might help to take a look at the template file. 
    if (this.isDisplayContextParameterUpdate) {
      this.journeyStartPageNumber = CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS;
      this.journeyEndPageNumber = CaseFlagFieldState.FLAG_UPDATE_WELSH_TRANSLATION;
    } else {  
      this.journeyStartPageNumber = CaseFlagFieldState.FLAG_LOCATION;
      this.journeyEndPageNumber = CaseFlagFieldState.FLAG_STATUS;
    }

    // Now that we've set the start page number, let's set the current page number. 
    this.journeyPageNumber = this.journeyStartPageNumber;

    // If we've navigated to this page, then we know by default, we want to set the 
    // journey page number to the field state. 
    if (navigatedTo) {
      this.journeyPageNumber = this.fieldState;
      this.journeyPreviousPageNumber = this.journeyEndPageNumber++;
    }

    // Provided we have some stored state, i.e. when going backwards, we want 
    // to get the last visited page, etc. 
    const state = this.multipageComponentStateService.getJourneyState(this);

    if (state) {
      const { journeyPageNumber, journeyStartPageNumber, journeyEndPageNumber } = state;

      this.journeyPageNumber = journeyPageNumber;
      this.journeyStartPageNumber = journeyStartPageNumber;
      this.journeyEndPageNumber = journeyEndPageNumber;
    }

    this.multipageComponentStateService.isAtStart = this.journeyPageNumber === this.journeyStartPageNumber;
  }

  public onPageChange(): void {
    this.multipageComponentStateService.isAtStart = this.fieldState === this.caseFlagFieldState.FLAG_LOCATION;
  }

  public setDisplayContextParameterUpdate(displayContextParameter: string): boolean {
    return displayContextParameter === CaseFlagDisplayContextParameter.UPDATE ||
      displayContextParameter === CaseFlagDisplayContextParameter.UPDATE_EXTERNAL ||
      displayContextParameter === CaseFlagDisplayContextParameter.UPDATE_2_POINT_1;
  }

  public setDisplayContextParameterExternal(displayContextParameter: string): boolean {
    return displayContextParameter === CaseFlagDisplayContextParameter.CREATE_EXTERNAL ||
      displayContextParameter === CaseFlagDisplayContextParameter.UPDATE_EXTERNAL;
  }

  public setDisplayContextParameter2Point1Enabled(displayContextParameter: string): boolean {
    return displayContextParameter === CaseFlagDisplayContextParameter.CREATE_2_POINT_1 ||
      displayContextParameter === CaseFlagDisplayContextParameter.UPDATE_2_POINT_1;
  }

  public onCaseFlagStateEmitted(caseFlagState: CaseFlagState): void {
    this.caseEditDataService.clearFormValidationErrors();

    this.errorMessages = caseFlagState.errorMessages;
    this.selectedFlag = caseFlagState.selectedFlag;

    // Validation succeeded; proceed to next state or final review stage ("Check your answers")
    if (this.errorMessages.length === 0) {
      if (this.canMoveToFinalReviewStage(caseFlagState)) {
        this.moveToFinalReviewStage();
        // Don't move to next state if current state is CaseFlagFieldState.FLAG_TYPE and the flag type is a parent - this
        // means the user needs to select from the next set of flag types before they can move on
      } else if (!caseFlagState.isParentFlagType) {
        // Proceed to next state
        this.proceedToNextState();
      }
    }
  }

  public canMoveToFinalReviewStage(caseFlagState: CaseFlagState): boolean {
    // If the journey is request support or manage support
    // and the current state is either CaseFlagFieldState.FLAG_COMMENTS or CaseFlagFieldState.FLAG_UPDATE
    // then move to final review stage
    if (this.isDisplayContextParameterExternal) {
      return caseFlagState.currentCaseFlagFieldState === CaseFlagFieldState.FLAG_COMMENTS ||
        caseFlagState.currentCaseFlagFieldState === CaseFlagFieldState.FLAG_UPDATE;
    }
    // If the current state is one of:
    // * CaseFlagFieldState.FLAG_STATUS AND Case Flags v2.1 is enabled
    // * CaseFlagFieldState.FLAG_COMMENTS AND Case Flags v2.1 is not enabled
    // * CaseFlagFieldState.FLAG_UPDATE and Welsh translation checkbox is not selected
    // * CaseFlagFieldState.FLAG_UPDATE_WELSH_TRANSLATION
    // then move to final review stage
    return (caseFlagState.currentCaseFlagFieldState ===
      CaseFlagFieldState.FLAG_STATUS && this.isDisplayContextParameter2Point1Enabled) ||
      (caseFlagState.currentCaseFlagFieldState ===
        CaseFlagFieldState.FLAG_COMMENTS && !this.isDisplayContextParameter2Point1Enabled) ||
      (caseFlagState.currentCaseFlagFieldState === CaseFlagFieldState.FLAG_UPDATE &&
        !this.caseFlagParentFormGroup.get(CaseFlagFormFields.IS_WELSH_TRANSLATION_NEEDED)?.value) ||
      caseFlagState.currentCaseFlagFieldState === CaseFlagFieldState.FLAG_UPDATE_WELSH_TRANSLATION;
  }

  public proceedToNextState(): void {
    if (!this.isAtFinalState()) {
      this.journeyPreviousPageNumber = this.fieldState;
      // Skip the "language interpreter" state if current state is CaseFlagFieldState.FLAG_TYPE and the flag type doesn't
      // have a "list of values" - currently, this is present only for those flag types that require language interpreter
      // selection
      if (this.fieldState === CaseFlagFieldState.FLAG_TYPE && !this.flagType?.listOfValues) {
        this.fieldState = CaseFlagFieldState.FLAG_COMMENTS;
      } else {
        this.fieldState++;
      }

      this.nextPage();
    }
  }

  public setFlagsCaseFieldValue(): void {
    // tslint:disable-next-line: switch-default
    switch (this.fieldState) {
      case CaseFlagFieldState.FLAG_STATUS:
        this.addFlagToCollection();
        break;
      case CaseFlagFieldState.FLAG_COMMENTS:
        if (this.isDisplayContextParameterExternal || !this.isDisplayContextParameter2Point1Enabled) {
          this.addFlagToCollection();
        }
        break;
      case this.manageFlagFinalState:
        this.updateFlagInCollection();
        break;
    }
  }

  public previousPage(): void {
    this.journeyPreviousPageNumber = this.fieldState;
    if (this.hasPrevious() && this.fieldState === CaseFlagFieldState.FLAG_COMMENTS && !this.flagType?.listOfValues) {
      this.fieldState = CaseFlagFieldState.FLAG_TYPE;
    } else if (this.hasPrevious()) {
      this.fieldState--;
    }
    super.previousPage();
  }

  public addFlagToCollection(): void {
    // Ensure no more than one new flag is being added at a time, by iterating through each Flags case field and removing
    // any previous entry from the details array where that entry has no id (hence it is new - and there should be only
    // one such entry). (This scenario occurs if the user repeats the Case Flag creation journey by using the "Change"
    // link and selects either the same flag location as before or a different one.)
    this.flagsData.forEach(instance => {
      // Use the pathToFlagsFormGroup property for each Flags case field to drill down to the correct part of the
      // CaseField value to remove the new value from
      let value = instance.caseField?.value;
      const pathToValue = instance.pathToFlagsFormGroup;
      // Root-level Flags CaseFields don't have a dot-delimited path - just the CaseField ID itself - so don't drill down
      if (pathToValue.indexOf('.') > -1) {
        pathToValue.slice(pathToValue.indexOf('.') + 1).split('.').forEach(part => value = value[part]);
      }
      if (value?.details?.length > 0) {
        const indexOfNewFlagDetail = value.details.findIndex(element => !element.hasOwnProperty('id'));
        if (indexOfNewFlagDetail > -1) {
          value.details.splice(indexOfNewFlagDetail, 1);
        }
      }
    });

    const formValues = this.caseFlagParentFormGroup?.value;
    // Determine the correct location - internal or external - for the new flag. If returned as undefined, this
    // indicates a configuration error with the external `Flags` object instance
    this.determinedLocation =
      this.determineLocationForFlag(!this.isDisplayContextParameterExternal, this.selectedFlagsLocation, formValues);
    // Do not mutate this.selectedFlagsLocation; if this.selectedFlagsLocation becomes undefined,
    // determineLocationForFlag() will no longer do anything when called with it - and the appropriate error message will
    // not be redisplayed if the user clicks "Next" again on the "Add comments" page, after the error is first shown

    if (this.determinedLocation) {
      const path = this.determinedLocation.pathToFlagsFormGroup;
      const flagDataRef = this.flagsData.find(item => item.pathToFlagsFormGroup === path);
      let flagsCaseFieldValue = flagDataRef.caseField?.value;
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
  }

  /**
   * Determines the correct location (i.e. either the internal or external instance of a `Flags` object) for a new flag,
   * according to the following:
   *
   * * Whether the user is internal or external (no effect for external users because they can access only the external
   * instance)
   * * The existence of two `Flags` objects - one internal, one external - linked by the same `groupId`;
   * * For flags of type "Other", whether "only visible to HMCTS staff" has been selected or not ("Other" defaults to
   * externally visible);
   * * For all other flag types, the value of the `externallyAvailable` attribute.
   *
   * If the user is internal then the new flag should be assigned to the external `Flags` instance if:
   * * Such an instance exists, AND
   * * The flag type is "Other" and "only visible to HMCTS staff" was not selected, OR
   * * The flag type is not "Other" and `externallyAvailable` is `true`.
   *
   * @param isInternalUser Whether the current user is internal or not
   * @param selectedFlagsLocation The currently selected location for the new flag
   * @param formValues All the values from the `caseFlagParentFormGroup`
   * @returns The correctly determined location: either the internal or external location (if one exists) where a groupId
   * is present; the original location otherwise. **Note:** If the external location is returned as undefined, this
   * indicates a configuration error
   */
  public determineLocationForFlag(isInternalUser: boolean, selectedFlagsLocation: FlagsWithFormGroupPath,
    formValues: any): FlagsWithFormGroupPath {
      if (isInternalUser && selectedFlagsLocation?.flags?.groupId) {
        if ((formValues?.flagType?.flagCode === this.otherFlagTypeCode && !formValues?.flagIsVisibleInternallyOnly) ||
          (formValues?.flagType?.flagCode !== this.otherFlagTypeCode && formValues?.flagType?.externallyAvailable)) {
            // If necessary, find the corresponding flags object with the same groupId and external visibility (should be
            // only one unless misconfigured)
            const location = selectedFlagsLocation.flags.visibility?.toLowerCase() === 'external'
              ? selectedFlagsLocation
              : this.flagsData.filter(
                (f) => f.flags?.groupId === selectedFlagsLocation.flags.groupId &&
                f.flags?.visibility?.toLowerCase() === 'external')?.[0];
            // If location is not truthy, set an error message and make caseFlagParentFormGroup invalid to prevent
            // navigation to the summary page (by not triggering the submit event)
            if (!location) {
              this.errorMessages.push({
                title: '',
                description: CaseFlagErrorMessage.NO_EXTERNAL_FLAGS_COLLECTION
              });
              this.caseFlagParentFormGroup.setErrors({
                noExternalCollection: true
              });
            }
            return location;
        } else {
          // If necessary, find the corresponding flags object with the same groupId and internal visibility (should be
          // only one unless misconfigured); assumed to be internal if visibility attribute is null or undefined
          const location = selectedFlagsLocation.flags.visibility?.toLowerCase() !== 'external'
            ? selectedFlagsLocation
            : this.flagsData.filter(
              (f) => f.flags?.groupId === selectedFlagsLocation.flags.groupId &&
              f.flags?.visibility?.toLowerCase() !== 'external')?.[0];
          // If location is not truthy, set an error message and make caseFlagParentFormGroup invalid to prevent
          // navigation to the summary page (by not triggering the submit event)
          if (!location) {
            this.errorMessages.push({
              title: '',
              description: CaseFlagErrorMessage.NO_INTERNAL_FLAGS_COLLECTION
            });
            this.caseFlagParentFormGroup.setErrors({
              noInternalCollection: true
            });
          }
          return location;
        }
      }
      return selectedFlagsLocation;
  }

  public updateFlagInCollection(): void {
    // Ensure no more than one flag is being updated at a time, by iterating through each Flags case field and resetting
    // the description, comments, status, and date/time modified (if present) for each entry in the details array, with
    // original values from the corresponding formatted_value property. (This scenario occurs if the user repeats the
    // Manage Case Flag journey by using the "Change" link and selects a different flag to update.)
    this.flagsData.forEach(instance => {
      // Use the pathToFlagsFormGroup property for each Flags case field to drill down to the correct part of the
      // CaseField value for which to restore the original values
      let value = instance.caseField?.value;
      let formattedValue = instance.caseField?.formatted_value;
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
      if (value?.details?.length > 0 && formattedValue && FieldsUtils.isNonEmptyObject(formattedValue)) {
        value.details.forEach(flagDetail => {
          const originalFlagDetail = formattedValue.details?.find(detail => detail.id === flagDetail.id);
          if (originalFlagDetail) {
            flagDetail.value.otherDescription = originalFlagDetail.value?.otherDescription || null;
            flagDetail.value.otherDescription_cy = originalFlagDetail.value?.otherDescription_cy || null;
            flagDetail.value.flagComment = originalFlagDetail.value?.flagComment || null;
            flagDetail.value.flagComment_cy = originalFlagDetail.value?.flagComment_cy || null;
            flagDetail.value.flagUpdateComment = originalFlagDetail.value?.flagUpdateComment || null;
            flagDetail.value.status = originalFlagDetail.value?.status;
            flagDetail.value.dateTimeModified = originalFlagDetail.value?.dateTimeModified || null;
          }
        });
      }
    });
    if (!this.selectedFlag) {
      this.selectedFlag = this.formGroup.get(this.selectedManageCaseLocation).value as FlagDetailDisplayWithFormGroupPath;
    }
    let flagsCaseFieldValue = this.selectedFlag.caseField?.value;
    // Use the pathToFlagsFormGroup property from the selected flag location to drill down to the correct part of the
    // CaseField value to apply changes to
    const path = this.selectedFlag.pathToFlagsFormGroup;
    // Root-level Flags CaseFields don't have a dot-delimited path - just the CaseField ID itself - so don't drill down
    if (path.indexOf('.') > -1) {
      path.slice(path.indexOf('.') + 1).split('.').forEach(part => flagsCaseFieldValue = flagsCaseFieldValue[part]);
    }
    if (flagsCaseFieldValue) {
      const flagDetailToUpdate = flagsCaseFieldValue.details?.find(
        detail => detail.id === this.selectedFlag.flagDetailDisplay?.flagDetail?.id);
      if (flagDetailToUpdate) {
        // Cache the *original* status of the flag before it is modified. This is needed if the user changes the flag status
        // then decides to return to any part of the flag update journey. The ManageCaseFlagsComponent and UpdateFlagComponent
        // should refer to a flag's original status, not the one set via the UI because this hasn't been persisted yet
        this.selectedFlag.originalStatus = flagDetailToUpdate.value?.status;
        // Update description fields only if flag type is "Other" (flag code OT0001); these fields apply only to that flag type
        // If their FormControls don't exist, it means these fields weren't visited as part of the "Update Flag" journey, so do
        // *not* update their values (otherwise they will become undefined)
        if (flagDetailToUpdate.value?.flagCode === this.otherFlagTypeCode) {
          if (this.caseFlagParentFormGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION)) {
            flagDetailToUpdate.value.otherDescription = this.caseFlagParentFormGroup.get(
              CaseFlagFormFields.OTHER_FLAG_DESCRIPTION).value;
          }
          if (this.caseFlagParentFormGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH)) {
            flagDetailToUpdate.value.otherDescription_cy = this.caseFlagParentFormGroup.get(
              CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH).value;
          }
        }
        // Ensure that any comments entered with language set to Welsh do not end up in the English comments field
        if (this.rpxTranslationService.language !== 'cy') {
          flagDetailToUpdate.value.flagComment = this.caseFlagParentFormGroup.get(CaseFlagFormFields.COMMENTS)?.value;
        }
        // Populate from the *English* comments field if:
        // * The Welsh comments field has no value (Welsh comments field acquires a value only when an HMCTS internal user has
        // gone through the "add translation" step for Manage Case Flags), AND
        // * The language is set to Welsh
        // If the FormControl doesn't exist, it means this field wasn't visited as part of the "Update Flag" journey, so do
        // *not* update its value (otherwise it will be overridden) - unless the user is external AND working in Welsh
        if (this.caseFlagParentFormGroup.get(CaseFlagFormFields.COMMENTS_WELSH) || this.rpxTranslationService.language === 'cy') {
          flagDetailToUpdate.value.flagComment_cy = this.caseFlagParentFormGroup.get(CaseFlagFormFields.COMMENTS_WELSH)?.value
          ? this.caseFlagParentFormGroup.get(CaseFlagFormFields.COMMENTS_WELSH)?.value
          : this.rpxTranslationService.language === 'cy'
            ? this.caseFlagParentFormGroup.get(CaseFlagFormFields.COMMENTS)?.value
            : null;
        }
        flagDetailToUpdate.value.flagUpdateComment = this.caseFlagParentFormGroup.get(CaseFlagFormFields.STATUS_CHANGE_REASON)?.value;
        flagDetailToUpdate.value.status = CaseFlagStatus[this.caseFlagParentFormGroup.get(CaseFlagFormFields.STATUS)?.value];
        flagDetailToUpdate.value.dateTimeModified = new Date().toISOString();
      }
    }
  }

  public isAtFinalState(): boolean {
    return this.isDisplayContextParameterUpdate
      ? this.fieldState === this.manageFlagFinalState
      : !this.isDisplayContextParameter2Point1Enabled
        ? this.fieldState === CaseFlagFieldState.FLAG_COMMENTS
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
    const langSearchTerm = this.caseFlagParentFormGroup?.value['languageSearchTerm'];
    const manualLangEntry = this.caseFlagParentFormGroup?.value['manualLanguageEntry'];
    const flagType = this.caseFlagParentFormGroup?.value['flagType'];
    const otherDesc = this.caseFlagParentFormGroup?.value['otherDescription'];
    const formValues = this.caseFlagParentFormGroup?.value;
    return {
      name: this.flagType?.name,
      name_cy: flagType?.name_cy,
      // Currently, subTypeValue, subTypeValue_cy and subTypeKey are applicable only to language flag types
      subTypeValue: langSearchTerm && this.rpxTranslationService.language === 'en'
        ? langSearchTerm.value
        : manualLangEntry && this.rpxTranslationService.language === 'en'
          ? manualLangEntry
          : null,
      subTypeValue_cy: langSearchTerm && this.rpxTranslationService.language === 'cy'
      ? langSearchTerm?.value_cy
      : manualLangEntry && this.rpxTranslationService.language === 'cy'
        ? manualLangEntry
        : null,
      // For user-entered (i.e. non-Reference Data) languages, there is no key
      subTypeKey: langSearchTerm
        ? langSearchTerm.key
        : null,
      otherDescription: flagType?.flagCode === this.otherFlagTypeCode &&
        otherDesc && this.rpxTranslationService.language === 'en'
        ? otherDesc
          : null,
      otherDescription_cy: flagType?.flagCode === this.otherFlagTypeCode &&
        otherDesc && this.rpxTranslationService.language === 'cy'
        ? otherDesc
        : null,
      flagComment: this.rpxTranslationService.language === 'en'
        ? formValues?.flagComments
        : null,
      flagComment_cy: this.rpxTranslationService.language === 'cy'
        ? formValues?.flagComments
        : null,
      flagUpdateComment: formValues?.statusReason,
      dateTimeCreated: new Date().toISOString(),
      path: flagType?.Path &&
        flagType?.Path.map(pathValue => Object.assign({ id: null, value: pathValue })),
      hearingRelevant: flagType?.hearingRelevant ? 'Yes' : 'No',
      flagCode: flagType?.flagCode,
      // Status should be set to whatever the default is for this flag type, if flag is being created by an external
      // user, otherwise it should be set to "Active" if Case Flags v2.1 is NOT enabled, or the selected status if it is
      status: this.isDisplayContextParameterExternal
        ? flagType?.defaultStatus
        : !this.isDisplayContextParameter2Point1Enabled
          ? CaseFlagStatus.ACTIVE
          : CaseFlagStatus[formValues?.selectedStatus],
      availableExternally: flagType?.externallyAvailable ? 'Yes' : 'No'
    } as FlagDetail;
  }

  public moveToFinalReviewStage(): void {
    this.caseFlagStateService.lastPageFieldState = this.fieldState;
    this.setFlagsCaseFieldValue();
    // Check that no errors have been set on caseFlagParentFormGroup (by determineLocationForFlag()); prevent moving to
    // final review stage if errors exist
    if (!this.caseFlagParentFormGroup.errors) {
      // Clear the "notAllCaseFlagStagesCompleted" error
      this.allCaseFlagStagesCompleted = true;
      this.formGroup.updateValueAndValidity();
      this.caseEditDataService.setTriggerSubmitEvent(true);
      // Update this.selectedFlagsLocation with the correctly determined location, so the correct value is available to
      // ReadCaseFlagFieldComponent when it initialises the Case Flag Summary page
      this.selectedFlagsLocation = this.determinedLocation;
    }
  }

  public ngOnDestroy(): void {
    this.multipageComponentStateService.setJourneyState(this);   
    // Reset the fieldstateToNavigate as the write journey completes at this point
    this.caseFlagStateService.fieldStateToNavigate = undefined;
    this.caseTitleSubscription?.unsubscribe();
  }

  public get manageFlagFinalState() {
    return this.caseFlagParentFormGroup.get(CaseFlagFormFields.IS_WELSH_TRANSLATION_NEEDED)?.value
    ? CaseFlagFieldState.FLAG_UPDATE_WELSH_TRANSLATION : CaseFlagFieldState.FLAG_UPDATE;
  }

  public setDisplayContextParameter(caseFields: CaseField[]): string {
    return caseFields.find(caseField => FieldsUtils.isCaseFieldOfType(caseField, ['FlagLauncher']))?.display_context_parameter;
  }
}
