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

  submit(event: any): void {
    console.log('CaseCreateConsumerComponent submit event=', event);
  }

  cancel(event: any): void {
    console.log('CaseCreateConsumerComponent cancel event=', event);
  }
}
