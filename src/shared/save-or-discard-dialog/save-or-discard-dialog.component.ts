import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'ccd-save-or-discard-dialog',
  templateUrl: './save-or-discard-dialog.component.html',
  styleUrls: ['../action-dialog.component.scss']
})
export class SaveOrDiscardDialogComponent {

  result: string;

  constructor(private matDialogRef: MatDialogRef<SaveOrDiscardDialogComponent>) {}

  cancel() {
    this.result = 'Cancel';
    this.matDialogRef.close(this.result);
  }
  save() {
    this.result = 'Save';
    this.matDialogRef.close(this.result);
  }
  discard() {
    this.result = 'Discard';
    this.matDialogRef.close(this.result);
  }
}
