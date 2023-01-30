import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'ccd-update-flag-welsh-translation-form',
  templateUrl: './update-flag-welsh-translation-form.component.html'
})
export class UpdateFlagWelshTranslationFormComponent implements OnInit {
  @Input() public formGroup: FormGroup;
  @Input() public readonly FLAG_COMMENTS_CONTROL_NAME = 'flagComment';
  @Input() public readonly FLAG_STATUS_CHANGE_REASON_CONTROL_NAME = 'flagStatusReasonChange';
  public readonly FLAG_COMMENTS_WELSH_CONTROL_NAME = 'flagCommentWelsh';
  public readonly FLAG_STATUS_CHANGE_REASON_WELSH_CONTROL_NAME = 'flagStatusReasonChangeWelsh';

  public ngOnInit(): void {
    if (this.formGroup) {
      this.formGroup.addControl(this.FLAG_COMMENTS_WELSH_CONTROL_NAME, new FormControl(''));
      this.formGroup.addControl(this.FLAG_STATUS_CHANGE_REASON_WELSH_CONTROL_NAME, new FormControl(''));
    }
  }
}
