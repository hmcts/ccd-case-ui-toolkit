import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'ccd-document-dialog',
  templateUrl: './document-dialog.component.html',
  styleUrls: ['./document-dialog.component.scss']
})
export class DocumentDialogComponent implements OnInit {

  result: string;

  constructor(private matDialogRef: MatDialogRef<DocumentDialogComponent>) {}

  ngOnInit() {
  }

  replace() {
    this.result = 'Replace';
    this.matDialogRef.close(this.result);
  }
  cancel() {
    this.result = 'Cancel';
    this.matDialogRef.close(this.result);
  }
}
