import { Component, Input, OnInit } from '@angular/core';
import { CaseView } from '../../../domain';

@Component({
  selector: 'ccd-case-basic-access-view',
  templateUrl: 'case-basic-access-view.component.html'
})
export class CaseBasicAccessViewComponent implements OnInit {

  @Input()
  public caseDetails: CaseView = null;

  @Input()
  public accessType: string = null;

  constructor(
  ) {}

  ngOnInit(): void {
    console.log(this.caseDetails);
  }

}
