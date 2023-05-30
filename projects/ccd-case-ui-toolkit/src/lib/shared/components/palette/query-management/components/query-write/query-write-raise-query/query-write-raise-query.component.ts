import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CaseView } from '../../../../../../domain';

@Component({
  selector: 'ccd-query-write-raise-query',
  templateUrl: './query-write-raise-query.component.html',
  styleUrls: ['./query-write-raise-query.component.scss']
})
export class QueryWriteRaiseQueryComponent implements OnInit {
  @Input() public formGroup: FormGroup;
  @Input() public caseView: CaseView;

  constructor() { }

  public ngOnInit() {
    this.formGroup = new FormGroup({
      fullName: new FormControl('', Validators.required),
      subject: new FormControl('', Validators.required),
      body: new FormControl('', Validators.required),
      isHearingRelated: new FormControl(null, Validators.required),
      documents: new FormControl([], Validators.required)
    });
  }
}
