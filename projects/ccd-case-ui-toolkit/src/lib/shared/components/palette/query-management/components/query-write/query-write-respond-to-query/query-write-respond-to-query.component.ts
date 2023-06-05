import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormDocument } from '../../../../../../domain';
import { QueryListItem } from '../../../models';

@Component({
  selector: 'ccd-query-write-respond-to-query',
  templateUrl: './query-write-respond-to-query.component.html'
})
export class QueryWriteRespondToQueryComponent implements OnInit {
  @Input() public queryItem: QueryListItem;
  public formGroup: FormGroup;

  public ngOnInit(): void {
    this.formGroup = new FormGroup({
      response: new FormControl('', Validators.required),
      documents: new FormControl(null)
    });
  }

  public onDocumentCollectionUpdate(documents: FormDocument[]): void {
    this.formGroup.get('documents').setValue(documents);
  }
}
