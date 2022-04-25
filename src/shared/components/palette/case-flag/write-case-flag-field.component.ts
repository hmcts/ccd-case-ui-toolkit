import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CaseField, ErrorMessage } from '../../../domain';
import { FieldsUtils } from '../../../services/fields';
import { CaseEditPageComponent } from '../../case-editor/case-edit-page/case-edit-page.component';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { CaseFlagState, FlagDetail, Flags } from './domain';
import { CaseFlagFieldState, CaseFlagText } from './enums';

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
  public errorMessage: ErrorMessage;
  public flagsData: Flags[];
  public caseFlagParentFormGroup = new FormGroup({});
  public flagCommentsOptional = false;
  public jurisdiction: string;
  public listOfValues: {key: string, value: string}[] = null;

  constructor(
    private readonly route: ActivatedRoute,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.formGroup = this.registerControl(new FormGroup({}, {
      validators: (_: AbstractControl): {[key: string]: boolean} | null => {
        if (!this.isAtFinalState()) {
          // Return an error to mark the FormGroup as invalid if not at the final state
          return {notAtFinalState: true};
        }
        return null;
      }
    }), true) as FormGroup;
    // Set starting field state
    this.fieldState = CaseFlagFieldState.FLAG_LOCATION;

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
              partyName: caseField.value.partyName,
              roleOnCase: caseField.value.roleOnCase,
              details: caseField.value.details
                ? ((caseField.value.details) as any[]).map(detail => {
                  return Object.assign({}, ...Object.keys(detail.value).map(k => {
                    switch (k) {
                      // These two fields are date-time fields
                      case 'dateTimeModified':
                      case 'dateTimeCreated':
                        return {[k]: new Date(detail.value[k])};
                      // This field is a "yes/no" field
                      case 'hearingRelevant':
                        return detail.value[k].toUpperCase() === 'YES' ? {[k]: true} : {[k]: false};
                      default:
                        return {[k]: detail.value[k]};
                    }
                  }))
                }) as FlagDetail[]
                : null
            }
          );
        }
        return flags;
      }, []) as Flags[];
    }

    // Set the parent Case Flag FormGroup for this component's children
    // TODO This needs to happen after the user has made the initial selection on flag location (first screen)
    // this.setCaseFlagParentFormGroup();
  }

  public onCaseFlagStateEmitted(caseFlagState: CaseFlagState): void {
    // Clear validation errors from the parent CaseEditPageComponent (given the "Next" button in a child component has
    // been clicked)
    this.caseEditPageComponent.validationErrors = [];
    this.errorMessages = caseFlagState.errorMessages;
    this.listOfValues = caseFlagState.listOfValues;
    // Don't move to next state if current state is CaseFlagFieldState.FLAG_TYPE and the flag type is a parent - this
    // means the user needs to select from the next set of flag types before they can move on
    if (this.errorMessages.length === 0 && !caseFlagState.isParentFlagType) {
      // Validation succeeded, can proceed to next state
      this.proceedToNextState();
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

    // Deliberately not part of an if...else statement with the above because validation needs to be triggered as soon as
    // the form is at the final state
    if (this.isAtFinalState()) {
      // Trigger validation to clear the "notAtFinalState" error if now at the final state
      this.formGroup.updateValueAndValidity();
    }
  }

  public isAtFinalState(): boolean {
    // The filter removes the non-numeric keys emitted due to how TypeScript enums are transpiled (see
    // https://www.crojach.com/blog/2019/2/6/getting-enum-keys-in-typescript for an explanation)
    return this.fieldState === Object.keys(CaseFlagFieldState).filter(key => parseInt(key, 10) >= 0).length - 1;
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
   */
  public setCaseFlagParentFormGroup(): void {
    // Dummy implementation for now, which uses the FormGroup of the first of this CaseField's siblings of type `Flags`
    // as the parent. The real one needs to use the FormGroup of the Flags object corresponding to the user's selection
    // of flag location
    const caseFlagFormGroupKey = Object.keys(this.formGroup.parent.controls).filter(
      key => FieldsUtils.isFlagsCaseField(this.formGroup.parent.controls[key].caseField))[0];
    this.caseFlagParentFormGroup = this.formGroup.parent.controls[caseFlagFormGroupKey];
  }
}
