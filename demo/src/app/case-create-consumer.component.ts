import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'case-create-consumer',
  template: `<div class="container-fluid">
                <ccd-case-create [jurisdiction]="jurisdictionId"
                              [caseType]="caseTypeId"
                              [event]="eventTriggerId"
                              (cancelled)="cancel($event)"
                              (submitted)="submit($event)"></ccd-case-create>
             </div>`
})
export class CaseCreateConsumerComponent implements OnInit {
  jurisdictionId = 'TEST';
  caseTypeId = 'TestAddressBookCase';
  eventTriggerId = 'createCase';

  ngOnInit() {
    console.log('CaseCreateConsumerComponent !!!!');
  }

  submit(event: any): void {
    console.log('CaseCreateConsumerComponent submit event=', event);
  }

  cancel(event: any): void {
    console.log('CaseCreateConsumerComponent cancel event=', event);
  }
}
