import { Component, Input, OnInit } from '@angular/core';
import { CaseView } from '../../../domain';

@Component({
  selector: 'ccd-case-challenged-access-view',
  templateUrl: 'case-challenged-access-view.component.html'
})
export class CaseChallengedAccessViewComponent implements OnInit {

  @Input()
  public caseDetails: CaseView = null;

  constructor(
  ) {}

  ngOnInit(): void {
    console.log(this.caseDetails);
  }

}
