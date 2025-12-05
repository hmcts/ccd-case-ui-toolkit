import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ccd-case-challenged-access-success',
  templateUrl: './case-challenged-access-success.component.html',
  standalone: false
})
export class CaseChallengedAccessSuccessComponent implements OnInit {
  public caseId: string;
  public jurisdiction: string;
  public caseType: string;

  constructor(private readonly route: ActivatedRoute) { }

  public ngOnInit(): void {
    this.caseId = this.route.snapshot.params.cid;
    this.jurisdiction = this.route.snapshot.params.jurisdiction;
    this.caseType = this.route.snapshot.params.caseType;
  }
}
