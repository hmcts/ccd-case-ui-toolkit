import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Jurisdiction, JurisdictionUIConfig } from '../../../domain';

@Component({
  selector: 'app-jurisdiction-shuttering-dialog',
  templateUrl: './jurisdiction-shuttering-dialog.component.html',
  styleUrls: ['../action-dialog.component.scss', './jurisdiction-shuttering-dialog.component.scss']
})
export class JurisdictionShutteringDialogComponent implements OnInit {

  result: string;
  jurisdictions: JurisdictionUIConfig[];

  constructor(private matDialogRef: MatDialogRef<JurisdictionShutteringDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public dialogData: any) {
    this.jurisdictions = dialogData.jurisdictionConfigs;
  }

  newAddress() {
    this.result = 'NewApplication';
    this.matDialogRef.close(this.result);
  }

  continueAsItIs() {
    this.result = 'OldApplication';
    this.matDialogRef.close(this.result);
  }

  ngOnInit() {
  }
}
