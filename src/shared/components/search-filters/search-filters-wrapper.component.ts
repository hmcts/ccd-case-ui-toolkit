import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Jurisdiction } from '../../domain';
import { READ_ACCESS } from '../../domain/case-view/access-types.model';
import { DefinitionsService } from '../../services';

@Component({
    selector: 'ccd-search-filters-wrapper',
    templateUrl: './search-filters-wrapper.component.html',
})

export class SearchFiltersWrapperComponent implements OnInit {

    @Input()
    public autoApply: boolean;

    @Output()
    public onApply: EventEmitter<any> = new EventEmitter();

    @Output()
    public onReset: EventEmitter<any> = new EventEmitter();

    @Output()
    public onJurisdiction: EventEmitter<any> = new EventEmitter();

    public jurisdictions: Jurisdiction[];
    public isVisible: boolean;

    constructor(
        private readonly definitionsService: DefinitionsService,
    ) {
    }

    public ngOnInit(): void {
        this.isVisible = false;

        this.definitionsService.getJurisdictions(READ_ACCESS)
            .subscribe(jurisdictions => {
                this.isVisible = true;
                this.jurisdictions = jurisdictions;
            });
    }

    public onWrapperApply(value) {
        this.onApply.emit(value);
    }

    public onWrapperReset(value) {
        this.onReset.emit(value);
    }

    public onWrapperJurisdiction(value) {
        this.onJurisdiction.emit(value);
    }
}
