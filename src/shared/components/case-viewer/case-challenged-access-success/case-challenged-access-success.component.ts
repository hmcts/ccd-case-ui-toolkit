import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ccd-case-challenged-access-success',
  templateUrl: './case-challenged-access-success.component.html'
})
export class CaseChallengedAccessSuccessComponent implements OnInit {

  public caseId: string;

  constructor(private readonly route: ActivatedRoute) { }

  public ngOnInit(): void {
    this.caseId = this.route.snapshot.data.case.case_id;
  }

}
