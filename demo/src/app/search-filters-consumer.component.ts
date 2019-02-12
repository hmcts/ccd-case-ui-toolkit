import { Component, OnInit } from '@angular/core';
import { Jurisdiction, CaseType } from '@hmcts/ccd-case-ui-toolkit';

@Component({
  selector: 'search-filters-consumer',
  template: `<div class="container-fluid">
                <ccd-search-filters [jurisdictions]="jurisdictions"
                                    [autoApply]="true"
                                    (onApply)="applied($event)"
                                    (onReset)="reset()"
                                    (onJuridiction)="jurisdictionSelected($event)"></ccd-search-filters>
             </div>`
})
export class SearchFiltersConsumerComponent implements OnInit {

    readonly CASE_TYPE_1: CaseType = {
        id: 'CT0',
        name: 'Case type 0',
        description: '',
        states: [],
        events: [],
        case_fields: [],
        jurisdiction: null
      };

    readonly CASE_TYPE_2: CaseType = {
        id: 'CT2',
        name: 'Case type 2',
        description: '',
        states: [],
        events: [],
        case_fields: [],
        jurisdiction: null
      };

    readonly CASE_TYPE_3: CaseType = {
        id: 'CT3',
        name: 'Case type 3',
        description: '',
        states: [],
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

    ngOnInit() {
        this.jurisdictions = [this.JURISDICTION_1, this.JURISDICTION_2];
    }

    applied(selected) {
        console.log('selected:', selected);
    }

    reset() {
        console.log('reset');
    }

    jurisdictionSelected(jurisdiction) {
        console.log('selected jurisdiction:', jurisdiction);
    }
}
