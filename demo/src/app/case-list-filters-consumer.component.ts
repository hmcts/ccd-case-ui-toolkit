import { Component, OnInit } from '@angular/core';

 @Component({
  selector: 'case-list-filters-consumer',
  templateUrl: './case-list-filters-consumer.component.html',
  styleUrls: ['./elements-documentation.scss']
})
export class CaseListFiltersConsumerComponent implements OnInit {

   defaults: any;

   code = `
   <ccd-case-list-filters
         [defaults]="defaults"
         (onApply)="applied($event)"
         (onReset)="reset($event)"
   ></ccd-case-list-filters>`;

   ngOnInit() {
      this.defaults = {
         jurisdiction_id: 'J1',
         case_type_id: 'CT1',
         state_id: 'S1'
     }
   }

   applied(selected) {
      console.log('selected:', selected);
   }

   reset() {
      console.log('reset');
   }

}
