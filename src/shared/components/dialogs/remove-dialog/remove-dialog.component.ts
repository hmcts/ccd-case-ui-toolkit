import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'ccd-remove-dialog',
  templateUrl: './remove-dialog.component.html',
  styleUrls: ['../action-dialog.component.scss']
})
export class RemoveDialogComponent {

  result: string;

  constructor(private matDialogRef: MatDialogRef<RemoveDialogComponent>) {}

  remove() {
    this.result = 'Remove';
    this.matDialogRef.close(this.result);
  }
  cancel() {
    this.result = 'Cancel';
    this.matDialogRef.close(this.result);
  }
}
