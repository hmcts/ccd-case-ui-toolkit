import { Component } from '@angular/core';

@Component({
  selector: 'case-create-consumer',
  templateUrl: './case-create-consumer.component.html',
  styleUrls: ['./elements-documentation.scss']
})
export class CaseCreateConsumerComponent {
  jurisdictionId = 'TEST';
  caseTypeId = 'TestAddressBookCase';
  eventTriggerId = 'createCase';
  code = `
<ccd-case-create [jurisdiction]="jurisdictionId"
                 [caseType]="caseTypeId"
                 [event]="eventTriggerId"
                 (cancelled)="cancel($event)"
                 (submitted)="submit($event)">
</ccd-case-create>`;
  event = `
{
  description: "Apply for a divorce",
  id: "create",
  summary: "Apply for a divorce"
}`;

  eventMessages = [];
  eventMessageCounter= 0;
  submit(event: any): void {
    this.eventMessageCounter++;
    console.log('CaseCreateConsumerComponent submit event=', event);
    this.eventMessages.push(`${this.eventMessageCounter} CaseCreateConsumerComponent submit event=`);
  }

  cancel(event: any): void {
    this.eventMessageCounter++;

    console.log('CaseCreateConsumerComponent cancel event=', event);
    this.eventMessages.push(`${this.eventMessageCounter} CaseCreateConsumerComponent cancel event=`);

  }
}
