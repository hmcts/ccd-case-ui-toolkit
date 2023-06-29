import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QueryListItem } from '../../models';

@Component({
  selector: 'ccd-query-details',
  templateUrl: './query-details.component.html',
  styleUrls: ['./query-details.component.scss']
})
export class QueryDetailsComponent {
  @Input() public query: QueryListItem;
  @Output() public backClicked: EventEmitter<boolean> = new EventEmitter();
  @Input() public caseId: string;

  public onBack(): void {
    this.backClicked.emit(true);
  }
}
