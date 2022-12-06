import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ccd-case-specific-access-success',
  templateUrl: './case-specific-access-success.component.html'
})
export class CaseSpecificAccessSuccessComponent implements OnInit {

  public caseId: string;

  constructor(private readonly route: ActivatedRoute) { }

  public ngOnInit(): void {
    this.caseId = this.route.snapshot.params.cid;
  }
}
