import { Component } from '@angular/core';

@Component({
  selector: 'case-progress-consumer',
  templateUrl: './case-progress-consumer.component.html',
  styleUrls: ['./elements-documentation.scss']
})
export class CaseProgressConsumerComponent {
  caseId = '1111222233334444';
  eventTriggerId = 'enterCaseIntoLegacy';
  code = `
<ccd-case-progress [case]="caseId"
                   [event]="eventTriggerId"
                   (cancelled)="cancel($event)"
                   (submitted)="submit($event)">
</ccd-case-progress>`;
  event = `
{
  description: "Enter case into legacy",
  id: "enterCaseIntoLegacy",
  summary: "Enter case into legacy"
}`;

  submit(event: any): void {
    console.log('CaseProgressConsumerComponent submit event=', event);

  }

  cancel(event: any): void {
    console.log('CaseProgressConsumerComponent cancel event=', event);
  }
}
