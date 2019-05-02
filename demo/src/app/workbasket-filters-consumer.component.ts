import { Component, OnInit } from '@angular/core';
import { Jurisdiction, CaseType } from '@hmcts/ccd-case-ui-toolkit';

 @Component({
  selector: 'workbasket-filters-consumer',
  templateUrl: './workbasket-filters-consumer.component.html',
  styleUrls: ['./elements-documentation.scss']
})
export class WorkbasketFiltersConsumerComponent implements OnInit {

   readonly CASE_TYPE_1: CaseType = {
      id: 'CT0',
      name: 'Case type 0',
      description: '',
      states: [
         {
           id: 'S1',
           name: 'State 1',
           description: ''
         },
         {
           id: 'S2',
           name: 'State 2',
           description: ''
         }
      ],
      events: [],
      case_fields: [],
      jurisdiction: null
   };

   readonly CASE_TYPE_2: CaseType = {
      id: 'CT2',
      name: 'Case type 2',
      description: '',
      states: [
         {
           id: 'S1',
           name: 'State 1',
           description: ''
         },
         {
           id: 'S2',
           name: 'State 2',
           description: ''
         }
      ],
      events: [],
      case_fields: [],
      jurisdiction: null
   };

   readonly CASE_TYPE_3: CaseType = {
      id: 'CT3',
      name: 'Case type 3',
      description: '',
      states: [
         {
           id: 'S1',
           name: 'State 1',
           description: ''
         },
         {
           id: 'S2',
           name: 'State 2',
           description: ''
         }
      ],
      events: [],
      case_fields: [],
      jurisdiction: null
   };

   readonly JURISDICTION_1: Jurisdiction = {
      id: 'J1',
      name: 'Jurisdiction 1',
      description: '',
      caseTypes: [this.CASE_TYPE_1, this.CASE_TYPE_2]
   };

   readonly JURISDICTION_2: Jurisdiction = {
      id: 'J2',
      name: 'Jurisdiction 2',
      description: '',
      caseTypes: [this.CASE_TYPE_3]
   };

   jurisdictions: Jurisdiction[];

   defaults: any;

   json: any;

   code = `
   <ccd-workbasket-filters
         [jurisdictions]="jurisdictions"
         [defaults]="defaults"
         (onApply)="applied($event)"
         (onReset)="reset($event)"
   ></ccd-workbasket-filters>`;

   ngOnInit() {
      this.jurisdictions = [this.JURISDICTION_1, this.JURISDICTION_2];
      this.defaults = {
         jurisdiction_id: 'J1',
         case_type_id: 'CT1',
         state_id: 'S1'
      };
      this.json = JSON;
   }

   applied(selected) {
      console.log('selected:', selected);
   }

   reset() {
      console.log('reset');
   }

}
