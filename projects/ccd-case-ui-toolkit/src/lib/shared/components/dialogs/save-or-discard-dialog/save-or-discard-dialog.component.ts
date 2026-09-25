import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'ccd-save-or-discard-dialog',
  templateUrl: './save-or-discard-dialog.component.html',
  styleUrls: ['../action-dialog.component.scss'],
  standalone: false
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
