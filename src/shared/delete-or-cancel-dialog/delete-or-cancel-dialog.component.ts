import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'ccd-delete-or-cancel-dialog',
  templateUrl: './delete-or-cancel-dialog.component.html',
  styleUrls: ['../action-dialog.component.scss']
})
export class DeleteOrCancelDialogComponent {

  result: string;

  constructor(private matDialogRef: MatDialogRef<DeleteOrCancelDialogComponent>) {}

  delete() {
    this.result = 'Delete';
    this.matDialogRef.close(this.result);
  }
  cancel() {
    this.result = 'Cancel';
    this.matDialogRef.close(this.result);
  }
}
