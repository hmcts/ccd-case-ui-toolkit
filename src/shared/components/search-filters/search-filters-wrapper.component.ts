import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Jurisdiction } from '../../domain';
import { DefinitionsService } from '../../services';
import { READ_ACCESS } from '../../domain/case-view/access-types.model';

@Component({
    selector: 'ccd-search-filters-wrapper',
    template: `
        <ccd-search-filters
            *ngIf="isVisible"
            [jurisdictions]="jurisdictions"
            [autoApply]="autoApply"
            (onApply)="onWrapperApply($event)"
            (onReset)="onWrapperReset($event)"
            (onJuridiction)="onWrapperJurisdiction($event)"
        ></ccd-search-filters>
    `,
})

export class SearchFiltersWrapperComponent implements OnInit {

    @Input()
    autoApply: boolean;

    @Output()
    onApply: EventEmitter<any> = new EventEmitter();

    @Output()
    onReset: EventEmitter<any> = new EventEmitter();

    @Output()
    onJurisdiction: EventEmitter<any> = new EventEmitter();

    jurisdictions: Jurisdiction[];
    isVisible: boolean;

    constructor(
        private definitionsService: DefinitionsService,
    ) {
    }

    ngOnInit(): void {
        this.isVisible = false;

        this.definitionsService.getJurisdictions(READ_ACCESS)
            .subscribe(jurisdictions => {
                this.isVisible = true;
                this.jurisdictions = jurisdictions;
            });
    }

    onWrapperApply(value) {
        this.onApply.emit(value);
    }

    onWrapperReset(value) {
        this.onReset.emit(value);
    }

    onWrapperJurisdiction(value) {
        this.onJurisdiction.emit(value);
    }
}
