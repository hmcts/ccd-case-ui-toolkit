import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'ccd-document-dialog',
  templateUrl: './document-dialog.component.html',
  styleUrls: ['../action-dialog.component.scss']
})
export class DocumentDialogComponent implements OnInit {

  public result: string;

  constructor(private readonly matDialogRef: MatDialogRef<DocumentDialogComponent>) {}

  public ngOnInit() {
  }

  public replace() {
    this.result = 'Replace';
    this.matDialogRef.close(this.result);
  }
  public cancel() {
    this.result = 'Cancel';
    this.matDialogRef.close(this.result);
  }
}
