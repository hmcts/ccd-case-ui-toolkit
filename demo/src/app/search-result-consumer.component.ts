import { Component, OnInit } from '@angular/core';
import { Jurisdiction, CaseType, CaseState, SearchResultView, PaginationMetadata } from '@hmcts/ccd-case-ui-toolkit';
import { FormGroup } from '@angular/forms';
import { AppConfig } from './app.config';
import { HttpClient } from '@angular/common/http';
import { NullInjector } from '@angular/core/src/di/injector';

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
    fg: FormGroup;

    resultsArr: any[] = new Array;

    code = `
    <ccd-search-result
        *ngIf="resultView"
        [jurisdiction]="jurisdiction"
        [caseType]="caseType"
        [caseState]="caseState"
        [caseFilterFG]="fg"
        [resultView]="resultView"
        [paginationMetadata]="paginationMetadata"
        [metadataFields]="metadataFields"
        [caseLinkUrlTemplate]="'/v2/case/case_id'"
        (changePage)="apply($event)"
        (clickCase)="gotoCase($event)"
    ></ccd-search-result>`;

    constructor(
        private appConfig: AppConfig, private http: HttpClient
    ) {
    }

    ngOnInit(): void {

        for (let i = 0; i < 27; i++) {
            this.resultsArr.push({
                case_id: '' + (i + 1),
                case_fields: {
                    TextField: 'Text field ' + (i + 1),
                    DateField: '2021-02-13T09:30:55.15'
                }
            });
        }

        let resultViewHardCoded: SearchResultView = null;
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

            resultViewHardCoded = {
                hasDrafts: () => false,
                columns: [{
                    'label': 'Text Field',
                    'order': 1,
                    'case_field_id': 'TextField',
                    'display_context_parameter': '',
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
                }, {
                        'label': 'Date ',
                        'order': 1,
                        'case_field_id': 'DateField',
                        'display_context_parameter': '#DATETIMEDISPLAY(YYYY-MM)',
                        'case_field_type': {
                            'id': 'dateField',
                            'type': 'Date',
                            'min': null,
                            'max': null,
                            'regular_expression': null,
                            'fixed_list_items': [],
                            'complex_fields': [],
                            'collection_field_type': null
                        }
                    }],
                results: this.resultsArr.slice(0, this.appConfig.getPaginationPageSize()),
                result_error: null
            };

            this.paginationMetadata = {
                total_results_count: 27,
                total_pages_count: 2
            };

            this.metadataFields = [];
        }, 2000);

        this.http.post('/data/internal/searchCases', {}).subscribe((data: SearchResultView) => this.resultView = data, err => this.resultView = resultViewHardCoded )
    }

    apply(selected) {
        const startingPoint = (selected.page - 1) * this.appConfig.getPaginationPageSize();
        const endingPoint = startingPoint + this.appConfig.getPaginationPageSize();
        const newArr = this.resultsArr.slice(startingPoint, endingPoint);

        this.resultView = {
            hasDrafts: () => false,
            columns: [{
                'label': 'Text Field',
                'order': 1,
                'case_field_id': 'TextField',
                'display_context_parameter': '',
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
            results: newArr
        };

        console.log(selected);

    }

  gotoCase(data) {
    console.log('data: ', data);
  }

}
