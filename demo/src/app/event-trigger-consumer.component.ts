import { Component, OnInit } from '@angular/core';
import { HttpError, CaseViewTrigger } from '@hmcts/ccd-case-ui-toolkit';

@Component({
    selector: 'case-create-consumer',
    templateUrl: 'event-trigger-consumer.component.html',
    styleUrls: ['./elements-documentation.scss']
})
export class EventTriggerConsumerComponent implements OnInit {

    triggers: CaseViewTrigger[];
    error: HttpError;
    triggerText: string;

    code = `
    <ccd-event-trigger
        [isDisabled]="isTriggerButtonDisabled()"
        [triggers]="triggers"
        [triggerText]="triggerText"
        (onTriggerChange)="clearErrorsAndWarnings()"
        (onTriggerSubmit)="applyTrigger($event)"
    ></ccd-event-trigger>`;

    triggersSample = `
    [
        {
            id: '1',
            name: 'Trigger 1',
            description: 'Trigger 1'
        }, {
            id: '2',
            name: 'Trigger 2',
            description: 'Trigger 2'
        }, {
            id: '3',
            name: 'Trigger 3',
            description: 'Trigger 3'
        }
    ]`;

    constructor() {
    }

    ngOnInit(): void {
        this.triggerText = 'Go';
        this.triggers = null;
        setTimeout(() => {
            this.triggers = [
                {
                    id: '1',
                    name: 'Trigger 1',
                    description: 'Trigger 1'
                }, {
                    id: '2',
                    name: 'Trigger 2',
                    description: 'Trigger 2'
                }, {
                    id: '3',
                    name: 'Trigger 3',
                    description: 'Trigger 3'
                }
            ];
        }, 2000);
    }

    applyTrigger(trigger: CaseViewTrigger) {

        console.log(trigger);

        if (trigger.id === '3') { // to sample failed callback
            this.error = new HttpError;
            this.error.error = 'error';
        }
    }

    clearErrorsAndWarnings(): void {
        this.error = null;
    }

    isTriggerButtonDisabled() {
        return this.error;
    }

}
