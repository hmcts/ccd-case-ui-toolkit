import { Component, OnInit } from '@angular/core';
import { Jurisdiction, CreateCaseFiltersSelection, HttpError } from '@hmcts/ccd-case-ui-toolkit';

@Component({
    selector: 'case-create-consumer',
    templateUrl: 'create-case-filters-consumer.component.html',
    styleUrls: ['./elements-documentation.scss']
})
export class CreateCaseFiltersConsumerComponent implements OnInit {

    jurisdictions: Jurisdiction[];
    error: HttpError;
    startButtonText:  string;

    code = `
    <ccd-create-case-filters
        [jurisdictions]="jurisdictions"
        [isDisabled]="hasErrors()"
        [startButtonText]="startButtonText"
        (selectionSubmitted)="apply($event)"
        (selectionChanged)="resetErrors()"
    ></ccd-create-case-filters>`;

    jurisdictionsSample = `
    [
        {
            id: 'FR',
            name: 'Financial Remedy',
            description: 'Financial Remedy: remedy',
            caseTypes: [{
                id: 'FR',
                description: 'Handling of the financial remedy',
                name: 'FR case - v108.10',
                states: null,
                events: [{
                    id: 'create',
                    name: 'Apply for a financial remedy',
                    description: 'Apply for a financial remedy',
                    pre_states: [],
                    post_state: null,
                    case_fields: []
                }, {
                    id: 'create2',
                    name: 'Apply for a financial remedy 2',
                    description: 'Apply for a financial remedy 2',
                    pre_states: [],
                    post_state: null,
                    case_fields: []
                }, {
                    id: 'create3',
                    name: 'Apply for a financial remedy 3',
                    description: 'Apply for a financial remedy 3',
                    pre_states: [],
                    post_state: null,
                    case_fields: []
                }]
            }]
        }
    ]`;

    constructor() {
    }

    ngOnInit(): void {
        this.startButtonText = 'Start';
        setTimeout(() => {
            this.jurisdictions = [
                {
                    id: 'FR',
                    name: 'Financial Remedy',
                    description: 'Financial Remedy: remedy',
                    caseTypes: [{
                        id: 'FR',
                        description: 'Handling of the financial remedy',
                        name: 'FR case - v108.10',
                        states: null,
                        events: [{
                            id: 'create',
                            name: 'Apply for a financial remedy',
                            description: 'Apply for a financial remedy',
                            pre_states: [],
                            post_state: null,
                            case_fields: []
                        }, {
                            id: 'create2',
                            name: 'Apply for a financial remedy 2',
                            description: 'Apply for a financial remedy 2',
                            pre_states: [],
                            post_state: null,
                            case_fields: []
                        }, {
                            id: 'create3',
                            name: 'Apply for a financial remedy 3',
                            description: 'Apply for a financial remedy 3',
                            pre_states: [],
                            post_state: null,
                            case_fields: []
                        }]
                    }]
                },
                {
                    id: 'DIVORCE',
                    name: 'Family Divorce',
                    description: 'Family Divorce: dissolution of marriage',
                    caseTypes: [{
                        id: 'DIVORCE',
                        description: 'Handling of the dissolution of marriage',
                        name: 'Divorce case - v108.10',
                        states: null,
                        events: [{
                            id: 'create',
                            name: 'Apply for a divorce',
                            description: 'Apply for a divorce',
                            pre_states: [],
                            post_state: null,
                            case_fields: []
                        }, {
                            id: 'create2',
                            name: 'Apply for a divorce 2',
                            description: 'Apply for a divorce 2',
                            pre_states: [],
                            post_state: null,
                            case_fields: []
                        }, {
                            id: 'create3',
                            name: 'Apply for a divorce 3',
                            description: 'Apply for a divorce 3',
                            pre_states: [],
                            post_state: null,
                            case_fields: []
                        }]
                    }]
                }
            ];
        }, 2000);
    }

    apply(selected: CreateCaseFiltersSelection) {
        console.log(selected);

        if (selected.eventId === 'create3') { // to sample failed callback
            this.error = new HttpError;
            this.error.error = 'error';
        }
    }

    resetErrors(): void {
        this.error = null;
    }

    hasErrors() {
      return this.error;
    }

}
