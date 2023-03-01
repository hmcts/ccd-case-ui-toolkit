import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorMessage } from '../../../../../../domain';
import { CaseFlagState, FlagDetailDisplayWithFormGroupPath } from '../../../domain';
import { CaseFlagFieldState, UpdateFlagErrorMessage } from '../../../enums';
import { CaseFlagFormFields } from '../../../enums/case-flag-form-fields.enum';

@Component({
  selector: 'ccd-update-flag-welsh-translation-form',
  templateUrl: './update-flag-welsh-translation-form.component.html',
  styleUrls: ['./update-flag-welsh-translation-form.component.scss']
})
export class UpdateFlagWelshTranslationFormComponent implements OnInit {
  @Input() public formGroup: FormGroup;
  @Input() public selectedFlag: FlagDetailDisplayWithFormGroupPath;

  @Output() public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public readonly caseFlagFormFields = CaseFlagFormFields;

  public ngOnInit(): void {
    const flagDetail = this.selectedFlag?.flagDetailDisplay?.flagDetail;

    this.formGroup.addControl(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION, new FormControl(flagDetail?.otherDescription, [Validators.maxLength(200)]));

    this.formGroup.addControl(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH, new FormControl('', [Validators.maxLength(200)]));

    this.formGroup.addControl(CaseFlagFormFields.COMMENTS_WELSH, new FormControl('', [Validators.maxLength(200)]));
  }

  public onNext(): void {
    // Validate flag comments entry
    // this.validateTextEntry();
    const errorMessages: ErrorMessage[] = [];
    if (this.formGroup.get(CaseFlagFormFields.COMMENTS_WELSH)?.errors?.maxlength) {
      errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED,
        fieldId: CaseFlagFormFields.COMMENTS_WELSH
      });
    }

    if (this.formGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH)?.errors?.maxlength) {
      errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED,
        fieldId: CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH
      });
    }

    // Return case flag field state, error messages, and selected flag detail to the parent. The selected flag must be
    // re-emitted because the parent component repopulates this on handling this EventEmitter
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE_WELSH_TRANSLATION,
      errorMessages,
      selectedFlag: this.selectedFlag,
    });

    window.scrollTo(0, 0);
  }
}
