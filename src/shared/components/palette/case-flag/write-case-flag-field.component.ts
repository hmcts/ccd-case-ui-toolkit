import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CaseField, ErrorMessage } from '../../../domain';
import { FieldsUtils } from '../../../services/fields';
import { CaseEditPageComponent } from '../../case-editor/case-edit-page/case-edit-page.component';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { CaseFlagState, FlagDetail, Flags } from './domain';
import { CaseFlagFieldState, CaseFlagStatus, CaseFlagText } from './enums';

@Component({
  selector: 'ccd-write-case-flag-field',
  templateUrl: './write-case-flag-field.component.html',
  styleUrls: ['./write-case-flag-field.component.scss']
})
export class WriteCaseFlagFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  @Input() public caseEditPageComponent: CaseEditPageComponent;

  public formGroup: FormGroup;
  public fieldState: number;
  public caseFlagFieldState = CaseFlagFieldState;
  public errorMessages: ErrorMessage[] = [];
  public createFlagCaption: CaseFlagText;
  public flagsData: Flags[];
  public selectedFlagDetail: FlagDetail;
  public caseFlagParentFormGroup = new FormGroup({});
  public flagCommentsOptional = false;
  public jurisdiction: string;
  public flagName: string;
  public flagPath: string[];
  public hearingRelevantFlag: boolean;
  public flagCode: string;
  public listOfValues: {key: string, value: string}[] = null;
  public isDisplayContextParameterUpdate: boolean;
  private allCaseFlagStagesCompleted = false;
  private readonly updateMode = '#ARGUMENT(UPDATE)';
  // Code for "Other" flag type as defined in Reference Data
  private readonly otherFlagTypeCode = 'OT0001';

  constructor(
    private readonly route: ActivatedRoute
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
          if (FieldsUtils.isFlagsCaseField(caseField) && caseField.value) {
            flags.push(
              {
                flagsCaseFieldId: caseField.id,
                partyName: caseField.value.partyName,
                roleOnCase: caseField.value.roleOnCase,
                details: caseField.value.details && caseField.value.details.length > 0
                  ? ((caseField.value.details) as any[]).map(detail => {
                    return Object.assign({}, ...Object.keys(detail.value).map(k => {
                      // The id property set below will be null for new case flag
                      // and will be unique id returned from CCD for update existing flag
                      switch (k) {
                        // These two fields are date-time fields
                        case 'dateTimeModified':
                        case 'dateTimeCreated':
                          return {[k]: new Date(detail.value[k]), 'id': detail.id};
                        // This field is a "yes/no" field
                        case 'hearingRelevant':
                          return detail.value[k].toUpperCase() === 'YES' ? {[k]: true, 'id': detail.id} : {[k]: false, 'id': detail.id};
                        default:
                          return {[k]: detail.value[k], 'id': detail.id};
                      }
                    }));
                  }) as FlagDetail[]
                  : null
              }
            );
          }
          return flags;
        }, []) as Flags[];

      this.isDisplayContextParameterUpdate = ((this.route.snapshot.data.eventTrigger.case_fields) as CaseField[])
        .some(caseField => FieldsUtils.isFlagLauncherCaseField(caseField)
          && caseField.display_context_parameter === this.updateMode);

      // Set starting field state
      this.fieldState = this.isDisplayContextParameterUpdate ? CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS : CaseFlagFieldState.FLAG_LOCATION;
    }
  }

  public onCaseFlagStateEmitted(caseFlagState: CaseFlagState): void {
    // If the current state is CaseFlagFieldState.FLAG_LOCATION and a flag location (a Flags instance) has been selected,
    // set the parent Case Flag FormGroup for this component's children by using the provided flagsCaseFieldId
    if (caseFlagState.currentCaseFlagFieldState === CaseFlagFieldState.FLAG_LOCATION
      && caseFlagState.selectedFlagsLocation
      && caseFlagState.selectedFlagsLocation.flagsCaseFieldId) {
      this.setCaseFlagParentFormGroup(caseFlagState.selectedFlagsLocation.flagsCaseFieldId);
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
    // If the current state is CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS
    // set the parent Case Flag FormGroup for this component's children by using the provided flagsCaseFieldId
    if (caseFlagState.currentCaseFlagFieldState === CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS) {
      this.setCaseFlagParentFormGroup(caseFlagState.flagsCaseFieldId);
    }

    // Clear validation errors from the parent CaseEditPageComponent (given the "Next" button in a child component has
    // been clicked)
    this.caseEditPageComponent.validationErrors = [];
    this.errorMessages = caseFlagState.errorMessages;
    this.selectedFlagDetail = caseFlagState.selectedFlagDetail;
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
    const flagsCaseFieldValue = this.caseFlagParentFormGroup['caseField'].value;
    if (flagsCaseFieldValue) {
      // Create a details array if one does not exist
      if (!flagsCaseFieldValue.hasOwnProperty('details')) {
        flagsCaseFieldValue.details = [];
      }
      // Ensure no more than one new flag is being added at a time, by removing any previous entry from the details
      // array where that entry has no id (hence it is new - and there should be only one such entry). (This scenario
      // occurs if the user repeats the Case Flag creation journey by using the "Change" link.)
      const indexOfNewFlagDetail = flagsCaseFieldValue.details.findIndex(element => !element.hasOwnProperty('id'));
      if (indexOfNewFlagDetail > -1) {
        flagsCaseFieldValue.details.splice(indexOfNewFlagDetail, 1);
      }
      // Populate new FlagDetail instance and add to the Flags data within the CaseField instance
      flagsCaseFieldValue.details.push({value: this.populateNewFlagDetailInstance()});
    }
  }

  public updateFlagInCollection(): void {
    const flagsCaseFieldValue = this.caseFlagParentFormGroup['caseField'].value;
    const flagDetailToUpdate = flagsCaseFieldValue.details.find(detail => detail.id === this.selectedFlagDetail.id);
    if (flagDetailToUpdate) {
      flagDetailToUpdate.value.flagComment = this.caseFlagParentFormGroup.value.flagComments
        ? this.caseFlagParentFormGroup.value.flagComments
        : null;
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
   * @param flagsCaseFieldId ID of the CaseField instance that contains `Flags` data for a given party or case
   */
  public setCaseFlagParentFormGroup(flagsCaseFieldId: string): void {
    this.caseFlagParentFormGroup = this.formGroup.parent.controls[flagsCaseFieldId];
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
    // Perform a submit manually (as if the user had clicked "Continue")
    this.caseEditPageComponent.submit();
  }
}
