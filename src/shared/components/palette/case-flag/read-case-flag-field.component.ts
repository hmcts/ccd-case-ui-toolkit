import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseTab } from '../../../domain';
import { FieldsUtils } from '../../../services/fields';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';
import { FlagDetail, Flags } from './domain';

@Component({
  selector: 'ccd-read-case-flag-field',
  templateUrl: './read-case-flag-field.component.html',
  styleUrls: ['./read-case-flag-field.component.scss']
})
export class ReadCaseFlagFieldComponent extends AbstractFieldReadComponent implements OnInit {

  public flagsData: Flags[];
  public partyLevelCaseFlagData: Flags[];
  public caseLevelCaseFlagData: Flags[];

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
            flags.push(this.mapValueToFlagsObject(caseField.value));
          }
          return flags;
        }, []) as Flags[];
      }
    } else if (this.context === PaletteContext.CHECK_YOUR_ANSWER) {
      // If the context is PaletteContext.CHECK_YOUR_ANSWER, the Flags data is already present within the FormGroup
      // (via the caseField property value for each control representing a Flags field)
      this.flagsData = [];
      Object.keys(this.formGroup.controls).filter(
        controlName => FieldsUtils.isFlagsCaseField(this.formGroup.controls[controlName]['caseField']))
          .forEach(key => this.flagsData.push(this.mapValueToFlagsObject(this.formGroup.controls[key]['caseField'].value)));
    }

    // TODO: In future, this needs to separate party-level and case-level flags
    this.generateCaseFlagData();
  }

  public generateCaseFlagData(): void {
    // Temporary assignment of all flags data to party level until it is known how party-level and case-level will be
    // distinguished
    this.partyLevelCaseFlagData = this.flagsData;
  }

  private mapValueToFlagsObject(value: object): Flags {
    return {
      partyName: value['partyName'],
      roleOnCase: value['roleOnCase'],
      details: value['details']
        ? ((value['details']) as any[]).map(detail => {
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
  }
}
