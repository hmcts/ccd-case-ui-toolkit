import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { QueryListItem } from '../../../models';

@Component({
  selector: 'ccd-query-write-respond-to-query',
  templateUrl: './query-write-respond-to-query.component.html'
})
export class QueryWriteRespondToQueryComponent implements OnInit {
  @Input() public queryItem: QueryListItem;
  @Input() public formGroup: FormGroup;
  @Output() public confirmDetails: EventEmitter<FormGroup> = new EventEmitter();

  public ngOnInit(): void {
    this.formGroup = new FormGroup({
      response: new FormControl(this.formGroup.controls['response']?.value ? this.formGroup.controls['response'].value : '', Validators.required),
      documents: new FormControl([], Validators.required)
    });
  }

  public submitForm(): void {
    this.confirmDetails.emit(this.formGroup);
  }
}
