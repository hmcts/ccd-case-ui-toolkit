import { Component } from '@angular/core';

 @Component({
  selector: 'case-timeline-consumer',
  templateUrl: './case-timeline-consumer.component.html',
  styleUrls: ['./elements-documentation.scss']
})
export class CaseTimelineConsumerComponent {

   caseId = '1111222233334444';

   code = `
   <ccd-case-timeline [case]="caseId"></ccd-case-timeline>`;

}
