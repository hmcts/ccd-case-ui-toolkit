import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormDocument } from '../../../../../../domain';

@Component({
  selector: 'ccd-query-write-raise-query',
  templateUrl: './query-write-raise-query.component.html',
  styleUrls: ['./query-write-raise-query.component.scss']
})
export class QueryWriteRaiseQueryComponent {
  public formGroup: FormGroup;

  constructor() {
    this.formGroup = new FormGroup({
      fullName: new FormControl('', Validators.required),
      subject: new FormControl('', Validators.required),
      body: new FormControl('', Validators.required),
      isHearingRelated: new FormControl(null, Validators.required),
      documents: new FormControl([])
    });
  }

  public onDocumentCollectionUpdate(documents: FormDocument[]): void {
    this.formGroup.get('documents').setValue(documents);
  }
}
