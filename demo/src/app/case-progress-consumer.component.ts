import { Component } from '@angular/core';

@Component({
  selector: 'case-progress-consumer',
  template: `<div  class="container-fluid">
                <ccd-case-progress [case]="caseId"
                              [event]="eventTriggerId"
                              (cancelled)="cancel($event)"
                              (submitted)="submit($event)"></ccd-case-progress>
             </div>`
})
export class CaseProgressConsumerComponent {
  caseId = '1111222233334444';
  eventTriggerId = 'enterCaseIntoLegacy';

  submit(event: any): void {
    console.log('CaseProgressConsumerComponent submit event=', event);

  }

  cancel(event: any): void {
    console.log('CaseProgressConsumerComponent cancel event=', event);
  }
}
