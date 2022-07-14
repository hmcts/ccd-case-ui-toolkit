import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'ccd-save-or-discard-dialog',
  templateUrl: './save-or-discard-dialog.component.html',
  styleUrls: ['../action-dialog.component.scss']
})
export class SaveOrDiscardDialogComponent {

  public result: string;

  constructor(private readonly matDialogRef: MatDialogRef<SaveOrDiscardDialogComponent>) {}

  public cancel() {
    this.result = 'Cancel';
    this.matDialogRef.close(this.result);
  }
  public save() {
    this.result = 'Save';
    this.matDialogRef.close(this.result);
  }
  public discard() {
    this.result = 'Discard';
    this.matDialogRef.close(this.result);
  }
}
