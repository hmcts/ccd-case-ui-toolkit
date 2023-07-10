import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SessionStorageService } from '../../../../../services';
import { QueryListItem } from '../../models';

@Component({
  selector: 'ccd-query-details',
  templateUrl: './query-details.component.html',
  styleUrls: ['./query-details.component.scss']
})
export class QueryDetailsComponent {
  @Input() public query: QueryListItem;
  @Output() public backClicked: EventEmitter<boolean> = new EventEmitter();

  constructor(private sessionStorage: SessionStorageService) { }

  public onBack(): void {
    this.backClicked.emit(true);
  }

  public isCaseworker(): boolean {
    const userDetails = JSON.parse(this.sessionStorage.getItem('userDetails'));
    return userDetails && userDetails.roles
      && !(userDetails.roles.includes('pui-case-manager')
        || userDetails.roles.some((role) => role.toLowerCase().includes('judge')))
  }
}
