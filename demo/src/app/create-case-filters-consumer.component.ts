import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { CallbackErrorsContext, AlertService, HttpError, Jurisdiction, CreateCaseFiltersSelection } from '@hmcts/ccd-case-ui-toolkit';

@Component({
    selector: 'case-create-consumer',
    template: `<div class="container-fluid">
                <div *ngIf="error" class="error-summary" role="group" aria-labelledby="edit-case-event_error-summary-heading" tabindex="-1">
                <h3 class="heading-medium error-summary-heading" id="edit-case-event_error-summary-heading">
                    The callback data failed validation
                </h3>
                <p>{{error.message}}</p>
                <ul *ngIf="error.details?.field_errors" class="error-summary-list">
                    <li *ngFor="let fieldError of error.details.field_errors">
                    {{fieldError.message}}
                    </li>
                </ul>
                </div>
                <ccd-callback-errors
                    [triggerTextContinue]="triggerTextStart"
                    [triggerTextIgnore]="triggerTextIgnoreWarnings"
                    [callbackErrorsSubject]="callbackErrorsSubject"
                    (callbackErrorsContext)="callbackErrorsNotify($event)">
                </ccd-callback-errors>
                <ccd-create-case-filters
                    [jurisdictions]="jurisdictions"
                    [isDisabled]="hasErrors()"
                    [startButtonText]="startButtonText"
                    (selectionSubmitted)="apply($event)"
                    (selectionChanged)="resetErrors()"
                ></ccd-create-case-filters>
             </div>`
})
export class CreateCaseFiltersConsumerComponent implements OnInit {
    static readonly TRIGGER_TEXT_START = 'Start';
    static readonly TRIGGER_TEXT_CONTINUE = 'Ignore Warning and Start';

    jurisdictions: Jurisdiction[];
    callbackErrorsSubject: Subject<any> = new Subject();

    triggerTextStart = CreateCaseFiltersConsumerComponent.TRIGGER_TEXT_START;
    triggerTextIgnoreWarnings = CreateCaseFiltersConsumerComponent.TRIGGER_TEXT_CONTINUE;
    startButtonText = CreateCaseFiltersConsumerComponent.TRIGGER_TEXT_START;
    ignoreWarning = false;
    error: HttpError;

    constructor(
        private router: Router,
        private alertService: AlertService) {
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.jurisdictions = [
                {
                    'id': 'FR',
                    'name': 'Financial Remedy',
                    'description': 'Financial Remedy: remedy',
                    'caseTypes': [{
                        'id': 'FR',
                        'description': 'Handling of the financial remedy',
                        'name': 'FR case - v108.10',
                        'states': null,
                        'events': [{
                            'id': 'create',
                            'name': 'Apply for a financial remedy',
                            'description': 'Apply for a financial remedy',
                            'pre_states': [],
                            'post_state': null,
                            'case_fields': []
                        }, {
                            'id': 'create2',
                            'name': 'Apply for a financial remedy 2',
                            'description': 'Apply for a financial remedy 2',
                            'pre_states': [],
                            'post_state': null,
                            'case_fields': []
                        }, {
                            'id': 'create3',
                            'name': 'Apply for a financial remedy 3',
                            'description': 'Apply for a financial remedy 3',
                            'pre_states': [],
                            'post_state': null,
                            'case_fields': []
                        }]
                    }]
                },
                {
                    'id': 'DIVORCE',
                    'name': 'Family Divorce',
                    'description': 'Family Divorce: dissolution of marriage',
                    'caseTypes': [{
                        'id': 'DIVORCE',
                        'description': 'Handling of the dissolution of marriage',
                        'name': 'Divorce case - v108.10',
                        'states': null,
                        'events': [{
                            'id': 'create',
                            'name': 'Apply for a divorce',
                            'description': 'Apply for a divorce',
                            'pre_states': [],
                            'post_state': null,
                            'case_fields': []
                        }, {
                            'id': 'create2',
                            'name': 'Apply for a divorce 2',
                            'description': 'Apply for a divorce 2',
                            'pre_states': [],
                            'post_state': null,
                            'case_fields': []
                        }, {
                            'id': 'create3',
                            'name': 'Apply for a divorce 3',
                            'description': 'Apply for a divorce 3',
                            'pre_states': [],
                            'post_state': null,
                            'case_fields': []
                        }]
                    }]
                }
            ];
        }, 2000);
    }

    apply(selected: CreateCaseFiltersSelection) {
        let queryParams = {};
        if (this.ignoreWarning) {
            queryParams['ignoreWarning'] = this.ignoreWarning;
        }
        return this.router.navigate(['/create/case', selected.jurisdictionId, selected.caseTypeId, selected.eventId], {
            queryParams
        }).catch(error => {
            this.error = error;
            this.callbackErrorsSubject.next(error);
        });
    }

    callbackErrorsNotify(errorContext: CallbackErrorsContext) {
        this.ignoreWarning = errorContext.ignore_warning;
        this.startButtonText = errorContext.trigger_text;
    }

    resetErrors(): void {
        this.error = null;
        this.ignoreWarning = false;
        this.callbackErrorsSubject.next(null);
        this.alertService.clear();
    }

    private hasErrors() {
      return this.error;
    }

}
