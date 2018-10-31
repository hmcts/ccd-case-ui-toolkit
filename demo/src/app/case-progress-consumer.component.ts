import { Component } from '@angular/core';

@Component({
  selector: 'case-progress-consumer',
  template: `<div class="screen-990">
                <ccd-case-progress [case]="caseId"
                              [event]="eventTriggerId"
                              (cancelled)="cancel($event)"
                              (submitted)="submit($event)"></ccd-case-progress>
             </div>`,
  styles: ['.screen-990 { width: 990px; margin: 0 auto; }']
})
export class CaseProgressConsumerComponent {
  caseId = '123456789012345';
  eventTriggerId = 'enterCaseIntoLegacy';

  submit(event: any): void {
    console.log('CaseProgressConsumerComponent submit event=', event);

  }

  cancel(event: any): void {
    console.log('CaseProgressConsumerComponent cancel event=', event);
  }
}
