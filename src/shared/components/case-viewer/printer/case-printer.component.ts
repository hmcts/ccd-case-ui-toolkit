import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseView, CasePrintDocument } from '../../../domain';

@Component({
  templateUrl: './case-printer.html'
})
export class CasePrinterComponent implements OnInit {

  caseDetails: CaseView;
  documents: CasePrintDocument[];

  constructor(
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.caseDetails = this.route.snapshot.data.case;
    this.documents = this.route.snapshot.data.documents;
  }

}
