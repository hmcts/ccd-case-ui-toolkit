import { Component, OnInit } from '@angular/core';
import { Jurisdiction, CaseType, CaseState, SearchResultView, PaginationMetadata } from '@hmcts/ccd-case-ui-toolkit';

@Component({
    selector: 'search-result-consumer',
    templateUrl: 'search-result-consumer.component.html',
    styleUrls: ['./elements-documentation.scss']
})
export class SearchResultConsumerComponent implements OnInit {

    jurisdiction: Jurisdiction;
    caseType: CaseType;
    caseState: CaseState;
    resultView: SearchResultView;
    paginationMetadata: PaginationMetadata;
    metadataFields: string[];

    code = `
    <ccd-search-result
        *ngIf="resultView"
        [jurisdiction]="jurisdiction"
        [caseType]="caseType"
        [caseState]="caseState"
        [resultView]="resultView"
        [paginationMetadata]="paginationMetadata"
        [metadataFields]="metadataFields"
        (changePage)="apply($event)"
    ></ccd-search-result>`;

    constructor() {
    }

    ngOnInit(): void {
        let resultsArr: any[] = new Array;

        for (let i = 0; i < 27; i++) {
            resultsArr.push({
                case_id: '1',
                case_fields: {
                    TextField: 'Text field ' + (i + 1)
                }
            });
        }

        setTimeout(() => {
            this.jurisdiction = {
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
            };

            this.caseType = {
                id: 'caseType1Id',
                name: 'Case Type 1',
                description: 'Case Type 1 desc',
                case_fields: [],
                events: null,
                states: null,
                jurisdiction: null
            };

            this.caseState = {
                id: 'caseState1Id',
                name: 'Case State 1',
                description: 'Case State 1 desc'
            };

            this.resultView = {
                hasDrafts: () => false,
                columns: [{
                    'label': 'Text Field',
                    'order': 1,
                    'case_field_id': 'TextField',
                    'case_field_type': {
                        'id': 'Text',
                        'type': 'Text',
                        'min': null,
                        'max': null,
                        'regular_expression': null,
                        'fixed_list_items': [],
                        'complex_fields': [],
                        'collection_field_type': null
                    }
                }],
                results: resultsArr,
                result_error: null
            };

            this.paginationMetadata = {
                total_results_count: 27,
                total_pages_count: 2
            };

            this.metadataFields = [];
        }, 2000);
    }

    apply(selected) {
        console.log(selected);

    }

}
