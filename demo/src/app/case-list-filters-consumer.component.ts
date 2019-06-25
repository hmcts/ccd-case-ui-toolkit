import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

   json: any;

   constructor(
      private router: Router,
   ) { }

   ngOnInit() {
      this.defaults = {
         jurisdiction_id: 'J1',
         case_type_id: 'CT1',
         state_id: 'S1'
      };
      this.json = JSON;
   }

   applied(arg: any) {
      this.router.navigate(['/case/case-list-filters'], {
         queryParams: arg.queryParams
      });
      console.log('selected:', arg);
   }

   reset() {
      this.router.navigate(['/case/case-list-filters']);
      console.log('reset');
   }

}
