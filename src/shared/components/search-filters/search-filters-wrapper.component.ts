import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Jurisdiction } from '../../domain';
import { DefinitionsService } from '../../services';
import { READ_ACCESS } from '../../domain/case-view/access-types.model';

@Component({
    selector: 'ccd-search-filters-wrapper',
    templateUrl: './search-filters-wrapper.component.html',
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
