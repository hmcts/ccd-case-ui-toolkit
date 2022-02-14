import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CaseField, ErrorMessage } from '../../../domain';
import { FieldsUtils } from '../../../services/fields';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { FlagDetail, Flags } from './domain';
import { CaseFlagFieldState, CaseFlagLocationStepText } from './enums';

@Component({
  selector: 'ccd-write-case-flag-field',
  templateUrl: './write-case-flag-field.component.html'
})
export class WriteCaseFlagFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  public formGroup: FormGroup;
  public fieldState: number;
  public caseFlagFieldState = CaseFlagFieldState;
  public flagLocationCaption: string;
  public flagLocationTitle: string;
  public errorMessage: ErrorMessage;
  public flagsData: Flags[];

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

    this.flagLocationCaption = CaseFlagLocationStepText.CAPTION;
    this.flagLocationTitle = CaseFlagLocationStepText.TITLE;

    // Extract all flags-related data from the CaseEventTrigger object in the snapshot data
    if (this.route.snapshot.data.eventTrigger && this.route.snapshot.data.eventTrigger.case_fields) {
      this.flagsData = ((this.route.snapshot.data.eventTrigger.case_fields) as CaseField[])
      .reduce((flags, caseField) => {
        if (FieldsUtils.isFlagsCaseField(caseField)) {
          flags.push(
            {
              partyName: caseField.value.partyName,
              roleOnCase: caseField.value.roleOnCase,
              details: ((caseField.value.details) as any[]).map(detail => {
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
            }
          );
        }
        return flags;
      }, []) as Flags[];
    }
  }

  public onNext(): void {
    if (!this.isAtFinalState()) {
      this.fieldState++;
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
}
