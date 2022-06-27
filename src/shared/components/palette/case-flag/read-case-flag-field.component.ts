import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CaseField, CaseTab } from '../../../domain';
import { FieldsUtils } from '../../../services/fields';
import { CaseEditPageComponent } from '../../case-editor/case-edit-page/case-edit-page.component';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';
import { FlagDetail, FlagDetailDisplay, Flags } from './domain';

@Component({
  selector: 'ccd-read-case-flag-field',
  templateUrl: './read-case-flag-field.component.html',
  styleUrls: ['./read-case-flag-field.component.scss']
})
export class ReadCaseFlagFieldComponent extends AbstractFieldReadComponent implements OnInit {

  @Input() public caseEditPageComponent: CaseEditPageComponent;

  public flagsData: Flags[];
  public partyLevelCaseFlagData: Flags[];
  public caseLevelCaseFlagData: Flags;
  public paletteContext = PaletteContext;
  public flagForSummaryDisplay: FlagDetailDisplay;
  public caseLevelFirstColumnHeader: string;
  public readonly caseLevelCaseFlagsFieldId = 'caseFlags';
  public readonly caseNameMissing = 'Case name missing';

  constructor(
    private readonly route: ActivatedRoute
  ) {
    super();
  }

  public ngOnInit(): void {
    // If the context is PaletteContext.DEFAULT, the Flags fields need to be located by CaseTab (they won't be present
    // in the FormGroup - only the FlagLauncher field is present)
    if (this.context === PaletteContext.DEFAULT) {
      // Determine the tab this CaseField belongs to (should be only one), from the CaseView object in the snapshot
      // data, and extract all flags-related data from its Flags fields
      if (this.route.snapshot.data.case && this.route.snapshot.data.case.tabs) {
        this.flagsData = (this.route.snapshot.data.case.tabs as CaseTab[])
        .filter(tab => tab.fields && tab.fields
          .some(caseField => caseField.field_type.type === 'FlagLauncher'))
        [0].fields.reduce((flags, caseField) => {
          if (FieldsUtils.isFlagsCaseField(caseField) && caseField.value) {
            flags.push(this.mapCaseFieldToFlagsObject(caseField));
          }
          return flags;
        }, []) as Flags[];
      }

      // Separate the party-level and case-level flags
      this.partyLevelCaseFlagData = this.flagsData.filter(
        flagsInstance => flagsInstance.flagsCaseFieldId !== this.caseLevelCaseFlagsFieldId);
      // There will be only one case-level flags instance containing all case-level flag details
      this.caseLevelCaseFlagData = this.flagsData.find(
        flagsInstance => flagsInstance.flagsCaseFieldId === this.caseLevelCaseFlagsFieldId);
    } else if (this.context === PaletteContext.CHECK_YOUR_ANSWER) {
      // If the context is PaletteContext.CHECK_YOUR_ANSWER, the Flags data is already present within the FormGroup.
      // Determine which Flags instance to display on the summary page by looking for a child FormGroup whose controls
      // include one called "flagType", which will have been added during the Create Case Flag journey (hence denoting
      // a new flag) - there should be only one such child FormGroup because only one flag can be created at a time
      const keyOfFormGroupWithNewFlag = Object.keys(this.formGroup.controls).filter(
        controlName => Object.keys(
          (this.formGroup.controls[controlName] as FormGroup).controls).indexOf('flagType') > -1);
      if (keyOfFormGroupWithNewFlag.length > 0) {
        this.flagForSummaryDisplay = this.mapNewFlagFormGroupToFlagDetailDisplayObject(
          this.formGroup.controls[keyOfFormGroupWithNewFlag[0]] as FormGroup);
      }
    }

    this.caseLevelFirstColumnHeader = this.caseEditPageComponent.getCaseTitle()
      ? this.caseEditPageComponent.getCaseTitle()
      : this.caseNameMissing;
  }

  private mapCaseFieldToFlagsObject(caseField: CaseField): Flags {
    return {
      flagsCaseFieldId: caseField.id,
      partyName: caseField.value['partyName'],
      roleOnCase: caseField.value['roleOnCase'],
      details: caseField.value['details'] && caseField.value['details'].length > 0
        ? ((caseField.value['details']) as any[]).map(detail => {
          return Object.assign({}, ...Object.keys(detail.value).map(k => {
            switch (k) {
              // These two fields are date-time fields
              case 'dateTimeModified':
              case 'dateTimeCreated':
                return {[k]: detail.value[k] ? new Date(detail.value[k]) : null};
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
  }

  private mapNewFlagFormGroupToFlagDetailDisplayObject(formGroup: FormGroup): FlagDetailDisplay {
    if (formGroup && formGroup['caseField']) {
      return {
        partyName: formGroup['caseField'].value.partyName,
        // Look in the details array for the object that does *not* have an id - this indicates it is the new flag
        flagDetail: formGroup['caseField'].value.details.find(element => !element.hasOwnProperty('id')).value
      } as FlagDetailDisplay;
    }

    return null;
  }
}
