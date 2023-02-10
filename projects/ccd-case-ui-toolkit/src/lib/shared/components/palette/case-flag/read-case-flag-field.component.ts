import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseTab } from '../../../domain';
import { FieldsUtils } from '../../../services/fields';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';
import { FlagDetailDisplay, FlagsWithFormGroupPath } from './domain';
import { CaseFlagSummaryListDisplayMode } from './enums';

@Component({
  selector: 'ccd-read-case-flag-field',
  templateUrl: './read-case-flag-field.component.html',
  styleUrls: ['./read-case-flag-field.component.scss']
})
export class ReadCaseFlagFieldComponent extends AbstractFieldReadComponent implements OnInit {

  public flagsData: FlagsWithFormGroupPath[];
  public partyLevelCaseFlagData: FlagsWithFormGroupPath[];
  public caseLevelCaseFlagData: FlagsWithFormGroupPath;
  public paletteContext = PaletteContext;
  public flagForSummaryDisplay: FlagDetailDisplay;
  public summaryListDisplayMode: CaseFlagSummaryListDisplayMode;

  public pathToFlagsFormGroup: string;
  public readonly caseLevelCaseFlagsFieldId = 'caseFlags';
  public readonly caseNameMissing = 'Case name missing';
  private readonly createMode = '#ARGUMENT(CREATE)';
  private readonly updateMode = '#ARGUMENT(UPDATE)';
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router
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
          // There could be more than one FlagLauncher field instance so an additional check of caseField ID is
          // required to ensure the correct instance is obtained
          .some(caseField => caseField.field_type.type === 'FlagLauncher' && caseField.id === this.caseField.id))
        [0].fields.reduce((flags, caseField) => {
          return FieldsUtils.extractFlagsDataFromCaseField(flags, caseField, caseField.id, caseField);
        }, []);
      }

      // Separate the party-level and case-level flags
      this.partyLevelCaseFlagData = this.flagsData.filter(
        instance => instance.pathToFlagsFormGroup !== this.caseLevelCaseFlagsFieldId);
      // There will be only one case-level flags instance containing all case-level flag details
      this.caseLevelCaseFlagData = this.flagsData.find(
        instance => instance.pathToFlagsFormGroup === this.caseLevelCaseFlagsFieldId);
    } else if (this.context === PaletteContext.CHECK_YOUR_ANSWER) {
      // If the context is PaletteContext.CHECK_YOUR_ANSWER, the Flags data is already present within the FormGroup.
      // The FlagLauncher component, WriteCaseFlagFieldComponent, holds a reference to:
      // i) the parent FormGroup for the Flags instance where changes have been made;
      // ii) the currently selected flag (selectedFlag) if one exists
      const flagLauncherControlName = Object.keys(this.formGroup.controls).find(
        controlName => FieldsUtils.isFlagLauncherCaseField(this.formGroup.get(controlName)['caseField']));
      if (flagLauncherControlName && this.formGroup.get(flagLauncherControlName)['component']) {
        const flagLauncherComponent = this.formGroup.get(flagLauncherControlName)['component'];
        // The FlagLauncher component holds a reference (selectedFlagsLocation) containing the CaseField instance to
        // which the new flag has been added
        if (flagLauncherComponent.caseField.display_context_parameter === this.createMode &&
          flagLauncherComponent.selectedFlagsLocation) {
          // this.flagLocation = flagLauncherComponent.selectedFlagsLocation;
          this.pathToFlagsFormGroup = flagLauncherComponent.selectedFlagsLocation.pathToFlagsFormGroup;
          this.flagForSummaryDisplay = this.extractNewFlagToFlagDetailDisplayObject(
            flagLauncherComponent.selectedFlagsLocation
          );
            // Set the display mode for the "Review flag details" summary page
            this.summaryListDisplayMode = CaseFlagSummaryListDisplayMode.CREATE;
        // The FlagLauncher component holds a reference (selectedFlag), which gets set after the selection step of the
        // Manage Case Flags journey
        } else if (flagLauncherComponent.caseField.display_context_parameter === this.updateMode &&
          flagLauncherComponent.selectedFlag) {
            this.flagForSummaryDisplay =
              this.formGroup.get(flagLauncherControlName)['component'].selectedFlag.flagDetailDisplay;
            // Set the display mode for the "Review flag details" summary page
            this.summaryListDisplayMode = CaseFlagSummaryListDisplayMode.MANAGE;
        }
      }
    }
  }

  private extractNewFlagToFlagDetailDisplayObject(selectedFlagsLocation: FlagsWithFormGroupPath): FlagDetailDisplay {
    // Use the pathToFlagsFormGroup property from the selected flag location to drill down to the correct part of the
    // CaseField value containing the new flag
    let flagsCaseFieldValue = selectedFlagsLocation.caseField.value;
    const path = selectedFlagsLocation.pathToFlagsFormGroup;
    // Root-level Flags CaseFields don't have a dot-delimited path - just the CaseField ID itself - so don't drill down
    if (path.indexOf('.') > -1) {
      path.slice(path.indexOf('.') + 1).split('.').forEach(part => flagsCaseFieldValue = flagsCaseFieldValue[part]);
    }
    if (flagsCaseFieldValue) {
      return {
        partyName: flagsCaseFieldValue.partyName,
        // Look in the details array for the object that does *not* have an id - this indicates it is the new flag
        flagDetail: flagsCaseFieldValue.details.find(element => !element.hasOwnProperty('id')).value
      } as FlagDetailDisplay;
    }

    return null;
  }

  public navigateBackToForm(fieldState: number): void {
    const eidPathParam = this.route.snapshot.paramMap.get('eid');
    this.router.navigate([`../${eidPathParam}`], {
      relativeTo: this.route,
      state: {
        fieldState,
      }
    });
  }
}
