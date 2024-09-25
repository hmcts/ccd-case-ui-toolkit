import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseTab } from '../../../domain';
import { FieldsUtils } from '../../../services/fields';
import { CaseFlagStateService } from '../../case-editor/services/case-flag-state.service';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';
import { FlagDetailDisplay, FlagsWithFormGroupPath } from './domain';
import { CaseFlagDisplayContextParameter, CaseFlagStatus } from './enums';

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
  public displayContextParameter: CaseFlagDisplayContextParameter;
  public caseFlagsExternalUser = false;
  public pathToFlagsFormGroup: string;
  private readonly caseLevelCaseFlagsFieldId = 'caseFlags';

  public get caseFlagDisplayContextParameter(): typeof CaseFlagDisplayContextParameter {
    return CaseFlagDisplayContextParameter;
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly caseFlagStateService: CaseFlagStateService
  ) {
    super();
  }

  public ngOnInit(): void {
    const flagLauncherControlName = Object.keys(this.formGroup.controls).find(
      controlName => FieldsUtils.isCaseFieldOfType(this.formGroup.get(controlName)['caseField'], ['FlagLauncher']));
    const flagLauncherComponent = this.formGroup.get(flagLauncherControlName)?.['component'];
    this.displayContextParameter = flagLauncherComponent?.caseField?.display_context_parameter;
    this.caseFlagsExternalUser = this.displayContextParameter === CaseFlagDisplayContextParameter.READ_EXTERNAL;

    // If the context is PaletteContext.DEFAULT, the Flags fields need to be located by CaseTab (they won't be present
    // in the FormGroup - only the FlagLauncher field is present)
    if (this.context === PaletteContext.DEFAULT) {
      // Determine the tab this CaseField belongs to (should be only one), from the CaseView object in the snapshot
      // data, and extract all flags-related data from its Flags fields
      if (this.route.snapshot.data.case?.tabs) {
        this.flagsData = (this.route.snapshot.data.case.tabs as CaseTab[])
          .filter((tab) => tab.fields?.some(
            // There could be more than one FlagLauncher field instance so an additional check of caseField ID is
            // required to ensure the correct instance is obtained
            (caseField) => caseField.field_type.type === 'FlagLauncher' && caseField.id === this.caseField.id))
          [0].fields?.reduce((flags, caseField) => FieldsUtils.extractFlagsDataFromCaseField(
            flags, caseField, caseField.id, caseField), []);
      }

      // Separate the party-level and case-level flags
      this.partyLevelCaseFlagData = this.flagsData.filter(
        (instance) => instance.pathToFlagsFormGroup !== this.caseLevelCaseFlagsFieldId);
      // If the user is internal, group all flags data by groupId where present so they see a combined collection of
      // internal and external flags data for each party
      if (!this.caseFlagsExternalUser) {
        const groupedFlagsData = this.partyLevelCaseFlagData
          .filter((f) => f.flags.groupId)
          .reduce((mergedFlagDetails, f) => {
            mergedFlagDetails[f.flags.groupId] = mergedFlagDetails[f.flags.groupId] || [];
            // The flags.details property (which should be an array) could be falsy; spread an empty array if so
            mergedFlagDetails[f.flags.groupId].push(...(f.flags.details || []));
            return mergedFlagDetails;
          }, Object.create(null));
        // Remove duplicate flags objects with the same groupId (which are going to be treated as one for display
        // purposes)
        const uniquePartyData = this.partyLevelCaseFlagData
          .filter((f) => f.flags.groupId)
          .reduce((flagsUniqueByGroupId, f) => {
            if (flagsUniqueByGroupId.findIndex(flag => flag.flags.groupId === f.flags.groupId) === -1) {
            // Set the corresponding grouped flags data
              f.flags.details = groupedFlagsData[f.flags.groupId];
              flagsUniqueByGroupId.push(f);
            }
            return flagsUniqueByGroupId;
          }, []);
        // Append flags objects with no groupId
        this.partyLevelCaseFlagData.filter((f) => !f.flags.groupId).forEach((f) => uniquePartyData.push(f));
        this.partyLevelCaseFlagData = uniquePartyData;
      }

      // There will be only one case-level flags instance containing all case-level flag details
      this.caseLevelCaseFlagData = this.flagsData.find(
        (instance) => instance.pathToFlagsFormGroup === this.caseLevelCaseFlagsFieldId);
    } else if (this.context === PaletteContext.CHECK_YOUR_ANSWER) {
      // If the context is PaletteContext.CHECK_YOUR_ANSWER, the Flags data is already present within the FormGroup.
      // The FlagLauncher component, WriteCaseFlagFieldComponent, holds a reference to:
      // i) the parent FormGroup for the Flags instance where changes have been made;
      // ii) the currently selected flag (selectedFlag) if one exists
      if (flagLauncherComponent) {
        // The FlagLauncher component holds a reference (selectedFlagsLocation) containing the CaseField instance to
        // which the new flag has been added
        if ((flagLauncherComponent.caseField.display_context_parameter === CaseFlagDisplayContextParameter.CREATE ||
          flagLauncherComponent.caseField.display_context_parameter === CaseFlagDisplayContextParameter.CREATE_2_POINT_1 ||
          flagLauncherComponent.caseField.display_context_parameter === CaseFlagDisplayContextParameter.CREATE_EXTERNAL) &&
          flagLauncherComponent.selectedFlagsLocation) {
          this.pathToFlagsFormGroup = flagLauncherComponent.selectedFlagsLocation.pathToFlagsFormGroup;
          this.flagForSummaryDisplay = this.extractNewFlagToFlagDetailDisplayObject(
            flagLauncherComponent.selectedFlagsLocation);
        // The FlagLauncher component holds a reference (selectedFlag), which gets set after the selection step of the
        // Manage Case Flags journey
        } else if ((flagLauncherComponent.caseField.display_context_parameter === CaseFlagDisplayContextParameter.UPDATE ||
          flagLauncherComponent.caseField.display_context_parameter === CaseFlagDisplayContextParameter.UPDATE_2_POINT_1 ||
          flagLauncherComponent.caseField.display_context_parameter === CaseFlagDisplayContextParameter.UPDATE_EXTERNAL) &&
          (flagLauncherComponent.selectedFlag ||
            (this.caseFlagStateService.formGroup.get('selectedManageCaseLocation').value.flagDetailDisplay && this.displayContextParameter === CaseFlagDisplayContextParameter.UPDATE_2_POINT_1))) {
          if (this.formGroup.get(flagLauncherControlName)['component']?.selectedFlag?.flagDetailDisplay !== undefined){
            this.flagForSummaryDisplay =
              this.formGroup.get(flagLauncherControlName)['component'].selectedFlag.flagDetailDisplay;
          } else {
            this.flagForSummaryDisplay =
              this.caseFlagStateService.formGroup.get('selectedManageCaseLocation').value.flagDetailDisplay;
          }
          // TODO: not the best solution, the caseFlagStateService should have all the fields, then we can delete a lot of the transformations here
          // in Create Case Flag it already has all fields
          const caseFlagFormGroupValue = this.caseFlagStateService.formGroup?.value;
          if (caseFlagFormGroupValue) {
            caseFlagFormGroupValue.status = CaseFlagStatus[caseFlagFormGroupValue.status];
            this.flagForSummaryDisplay.flagDetail = {
              ...this.flagForSummaryDisplay.flagDetail,
              ...caseFlagFormGroupValue
            };
          }
        }
      }
    }
  }

  private extractNewFlagToFlagDetailDisplayObject(selectedFlagsLocation: FlagsWithFormGroupPath): FlagDetailDisplay {
    // Use the pathToFlagsFormGroup property from the selected flag location to drill down to the correct part of the
    // CaseField value containing the new flag
    let flagsCaseFieldValue = selectedFlagsLocation.caseField?.value;
    const path = selectedFlagsLocation.pathToFlagsFormGroup;
    // Root-level Flags CaseFields don't have a dot-delimited path - just the CaseField ID itself - so don't drill down
    if (path.indexOf('.') > -1) {
      path.slice(path.indexOf('.') + 1).split('.').forEach(part => flagsCaseFieldValue = flagsCaseFieldValue[part]);
    }
    if (flagsCaseFieldValue) {
      return {
        partyName: flagsCaseFieldValue.partyName,
        // Look in the details array for the object that does *not* have an id - this indicates it is the new flag
        flagDetail: flagsCaseFieldValue.details?.find(element => !element.hasOwnProperty('id'))?.value
      } as FlagDetailDisplay;
    }

    return null;
  }

  public navigateBackToForm(fieldState: number): void {
    this.caseFlagStateService.fieldStateToNavigate = fieldState;
    this.router.navigate([`../${this.caseFlagStateService.pageLocation}`], { relativeTo: this.route });
  }
}
