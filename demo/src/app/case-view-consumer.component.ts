import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'case-create-consumer',
  templateUrl: './case-view-consumer.component.html',
  styleUrls: ['./elements-documentation.scss']
})
export class CaseViewConsumerComponent implements OnInit {
    caseId: string;
    code = `
    <ccd-case-view [case]="caseId"></ccd-case-view>`;

    constructor(
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.caseId = this.route.snapshot.params['cid'];
    }
}
