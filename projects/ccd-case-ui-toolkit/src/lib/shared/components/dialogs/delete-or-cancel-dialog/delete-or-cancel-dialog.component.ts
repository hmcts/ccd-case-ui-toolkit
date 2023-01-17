import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'ccd-delete-or-cancel-dialog',
  templateUrl: './delete-or-cancel-dialog.component.html',
  styleUrls: ['../action-dialog.component.scss']
})
export class DeleteOrCancelDialogComponent {

  public result: string;

  constructor(private readonly matDialogRef: MatDialogRef<DeleteOrCancelDialogComponent>) {}

  public delete() {
    this.result = 'Delete';
    this.matDialogRef.close(this.result);
  }
  public cancel() {
    this.result = 'Cancel';
    this.matDialogRef.close(this.result);
  }
}
