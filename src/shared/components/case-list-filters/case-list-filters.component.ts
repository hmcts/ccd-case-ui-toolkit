import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { READ_ACCESS } from '../../domain/case-view/access-types.model';
import { DefinitionsService } from '../../services';
import { Jurisdiction } from '../../domain';

@Component({
  selector: 'ccd-case-list-filters',
  templateUrl: './case-list-filters.component.html'
})
export class CaseListFiltersComponent implements OnInit {

  @Input()
  defaults;

  @Output()
  onApply: EventEmitter<any> = new EventEmitter();

  @Output()
  onReset: EventEmitter<any> = new EventEmitter();

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

}
