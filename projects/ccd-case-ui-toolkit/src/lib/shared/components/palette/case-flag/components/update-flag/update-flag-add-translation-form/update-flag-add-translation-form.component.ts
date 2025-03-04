import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage, Journey } from '../../../../../../domain';
import { CaseFlagState, FlagDetailDisplayWithFormGroupPath } from '../../../domain';
import {
  CaseFlagFieldState,
  CaseFlagFormFields,
  CaseFlagWizardStepTitle,
  UpdateFlagAddTranslationErrorMessage,
  UpdateFlagAddTranslationStep
} from '../../../enums';
import { AbstractJourneyComponent } from '../../../../base-field';

@Component({
  selector: 'ccd-update-flag-add-translation-form',
  templateUrl: './update-flag-add-translation-form.component.html'
})
export class UpdateFlagAddTranslationFormComponent extends AbstractJourneyComponent implements OnInit, Journey {
  @Input() public formGroup: FormGroup;

  @Output() public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public selectedFlag: FlagDetailDisplayWithFormGroupPath;
  public updateFlagAddTranslationTitle: CaseFlagWizardStepTitle;
  public errorMessages: ErrorMessage[] = [];
  public otherFlagDescriptionCharLimitErrorMessage: UpdateFlagAddTranslationErrorMessage = null;
  public otherFlagDescriptionWelshCharLimitErrorMessage: UpdateFlagAddTranslationErrorMessage = null;
  public flagCommentsCharLimitErrorMessage: UpdateFlagAddTranslationErrorMessage = null;
  public flagCommentsWelshCharLimitErrorMessage: UpdateFlagAddTranslationErrorMessage = null;
  public updateFlagAddTranslationStepEnum = UpdateFlagAddTranslationStep;
  public readonly caseFlagFormFields = CaseFlagFormFields;
  private readonly textMaxCharLimit = 200;
  private readonly selectedManageCaseLocation = 'selectedManageCaseLocation';

  public ngOnInit(): void {
    this.updateFlagAddTranslationTitle = CaseFlagWizardStepTitle.UPDATE_FLAG_ADD_TRANSLATION;
    this.selectedFlag = this.formGroup.get(this.selectedManageCaseLocation).value as FlagDetailDisplayWithFormGroupPath;
    this.multipageComponentStateService.getJourneyCollectionMainObject().journeyEndPageNumber++;
    const flagDetail = this.selectedFlag?.flagDetailDisplay?.flagDetail;
    this.formGroup.addControl(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION, new FormControl(flagDetail?.otherDescription));
    this.formGroup.addControl(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH, new FormControl(flagDetail?.otherDescription_cy));
    this.formGroup.addControl(CaseFlagFormFields.COMMENTS, new FormControl(flagDetail?.flagComment));
    this.formGroup.addControl(CaseFlagFormFields.COMMENTS_WELSH, new FormControl(flagDetail?.flagComment_cy));
  }

  public ngOnDestroy(): void {
    this.multipageComponentStateService.getJourneyCollectionMainObject().journeyEndPageNumber--;
  }

  public onNext(): void {
    // Validate translation entries
    this.validateTextEntry();

    // Return case flag field state, error messages, and selected flag detail to the parent. The selected flag must be
    // re-emitted because the parent component repopulates this on handling this EventEmitter
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE_WELSH_TRANSLATION,
      errorMessages: this.errorMessages,
      selectedFlag: this.selectedFlag,
    });

    window.scrollTo(0, 0);
  }

  private validateTextEntry(): void {
    this.otherFlagDescriptionCharLimitErrorMessage = null;
    this.otherFlagDescriptionWelshCharLimitErrorMessage = null;
    this.flagCommentsCharLimitErrorMessage = null;
    this.flagCommentsWelshCharLimitErrorMessage = null;
    this.errorMessages = [];

    if (this.formGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION)?.value?.length > this.textMaxCharLimit) {
      this.otherFlagDescriptionCharLimitErrorMessage = UpdateFlagAddTranslationErrorMessage.DESCRIPTION_CHAR_LIMIT_EXCEEDED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagAddTranslationErrorMessage.DESCRIPTION_CHAR_LIMIT_EXCEEDED,
        fieldId: CaseFlagFormFields.OTHER_FLAG_DESCRIPTION
      });
    }

    if (this.formGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH)?.value?.length > this.textMaxCharLimit) {
      this.otherFlagDescriptionWelshCharLimitErrorMessage = UpdateFlagAddTranslationErrorMessage.DESCRIPTION_CHAR_LIMIT_EXCEEDED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagAddTranslationErrorMessage.DESCRIPTION_CHAR_LIMIT_EXCEEDED,
        fieldId: CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH
      });
    }

    if (this.formGroup.get(CaseFlagFormFields.COMMENTS)?.value?.length > this.textMaxCharLimit) {
      this.flagCommentsCharLimitErrorMessage = UpdateFlagAddTranslationErrorMessage.COMMENTS_CHAR_LIMIT_EXCEEDED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagAddTranslationErrorMessage.COMMENTS_CHAR_LIMIT_EXCEEDED,
        fieldId: CaseFlagFormFields.COMMENTS
      });
    }

    if (this.formGroup.get(CaseFlagFormFields.COMMENTS_WELSH)?.value?.length > this.textMaxCharLimit) {
      this.flagCommentsWelshCharLimitErrorMessage = UpdateFlagAddTranslationErrorMessage.COMMENTS_CHAR_LIMIT_EXCEEDED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagAddTranslationErrorMessage.COMMENTS_CHAR_LIMIT_EXCEEDED,
        fieldId: CaseFlagFormFields.COMMENTS_WELSH
      });
    }
  }

  public next() {
    this.onNext();

    if (this.errorMessages.length === 0) {
      super.next();
    }
  }
}
