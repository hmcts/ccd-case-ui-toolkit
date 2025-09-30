import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
    selector: 'ccd-remove-dialog',
    templateUrl: './remove-dialog.component.html',
    styleUrls: ['../action-dialog.component.scss'],
    standalone: false
})
export class RemoveDialogComponent {

  public result: string;

  constructor(private readonly matDialogRef: MatDialogRef<RemoveDialogComponent>) {}

  public remove() {
    this.result = 'Remove';
    this.matDialogRef.close(this.result);
  }
  public cancel() {
    this.result = 'Cancel';
    this.matDialogRef.close(this.result);
  }
}
