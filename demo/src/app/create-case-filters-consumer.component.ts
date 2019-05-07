import { Component, OnInit } from '@angular/core';
import { CreateCaseFiltersSelection, HttpError } from '@hmcts/ccd-case-ui-toolkit';

@Component({
    selector: 'case-create-consumer',
    templateUrl: 'create-case-filters-consumer.component.html',
    styleUrls: ['./elements-documentation.scss']
})
export class CreateCaseFiltersConsumerComponent implements OnInit {

    error: HttpError;
    startButtonText:  string;

    code = `
    <ccd-create-case-filters
        [isDisabled]="hasErrors()"
        [startButtonText]="startButtonText"
        (selectionSubmitted)="apply($event)"
        (selectionChanged)="resetErrors()"
    ></ccd-create-case-filters>`;

    constructor() {
    }

    ngOnInit(): void {
        this.startButtonText = 'Start';
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
