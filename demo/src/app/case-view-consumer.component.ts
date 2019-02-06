import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'case-create-consumer',
  template: `<div class="container-fluid">
                <ccd-case-view [case]="caseId"></ccd-case-view>
             </div>`
})
export class CaseViewConsumerComponent implements OnInit {
    caseId: string;

    constructor(
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.caseId = this.route.snapshot.params['cid'];
    }
}
