import { Component, Input } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field';
import { JudicialUserModel } from '@hmcts/rpx-xui-common-lib';

@Component({
  selector: 'ccd-judicial-user-field',
  templateUrl: './judicial-user-field.component.html'
})
export class JudicialUserFieldComponent extends AbstractFieldReadComponent {
  @Input() public idValue: string = '';
  @Input() public serviceId: string = '';
  @Input() public placeholderContent: string = '';
  @Input() public judgeList: JudicialUserModel[];
}
