import { Component } from '@angular/core';

@Component({
  selector: 'case-create-consumer',
  template: `<div class="screen-990">
                <ccd-case-create [jurisdiction]="jurisdictionId"
                              [caseType]="caseTypeId"
                              [event]="eventTriggerId"
                              (cancelled)="cancel($event)"
                              (submitted)="submit($event)"></ccd-case-create>
             </div>`,
  styles: ['.screen-990 { width: 990px; margin: 0 auto; }']
})
export class CaseCreateConsumerComponent {
  jurisdictionId = 'TEST';
  caseTypeId = 'TestAddressBookCase';
  eventTriggerId = 'createCase';

  submit(event: any): void {
    console.log('CaseCreateConsumerComponent submit event=', event);
  }

  cancel(event: any): void {
    console.log('CaseCreateConsumerComponent cancel event=', event);
  }
}
