import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseView, CasePrintDocument } from '../../../domain';
import { CaseService } from '../../case-editor';

@Component({
  templateUrl: './case-printer.html'
})
export class CasePrinterComponent implements OnInit {

  caseDetails: CaseView;
  documents: CasePrintDocument[];

  constructor(
    private caseService: CaseService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (!this.route.snapshot.data.case) {
      this.caseService.caseViewSource.asObservable().subscribe(caseDetails => {
        this.caseDetails = caseDetails;
      });
    } else {
      this.caseDetails = this.route.snapshot.data.case;
    }
    this.documents = this.route.snapshot.data.documents;
  }

  isDataLoaded() {
    return this.caseDetails && this.documents ? true : false;
  }

}
