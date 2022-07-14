import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Jurisdiction } from '../../domain';
import { READ_ACCESS } from '../../domain/case-view/access-types.model';
import { DefinitionsService } from '../../services';

@Component({
  selector: 'ccd-case-list-filters',
  templateUrl: './case-list-filters.component.html'
})
export class CaseListFiltersComponent implements OnInit {

  @Input()
  public defaults;

  @Output()
  public onApply: EventEmitter<any> = new EventEmitter();

  @Output()
  public onReset: EventEmitter<any> = new EventEmitter();

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
        this.isVisible = jurisdictions.length > 0;
        this.jurisdictions = jurisdictions;
      });
  }

  public onWrapperApply(value) {
    this.onApply.emit(value);
  }

  public onWrapperReset(value) {
    this.onReset.emit(value);
  }

}
