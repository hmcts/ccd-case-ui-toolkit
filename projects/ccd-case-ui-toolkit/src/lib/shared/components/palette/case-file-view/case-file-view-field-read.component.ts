import { Component, OnInit } from '@angular/core';
import { CaseField, CaseTab } from '../../../domain';
import { UserInfo } from '../../../domain/user/user-info.model';
import { CaseFileViewFieldComponent } from './case-file-view-field.component';

@Component({
  selector: 'ccd-case-file-view-field',
  templateUrl: './case-file-view-field.component.html',
  styleUrls: ['./case-file-view-field.component.scss'],
})
export class CaseFileViewFieldReadComponent extends CaseFileViewFieldComponent implements OnInit {
  public caseField: CaseField;

  public ngOnInit(): void {
    super.ngOnInit();

    const userInfo: UserInfo = JSON.parse(this.sessionStorageService.getItem('userDetails'));

    // Get acls that intersects from acl roles and user roles
    const acls = this.caseField.acls.filter(acl => userInfo.roles.includes(acl.role));

    // As there can be more than one intersecting role, if any acls are update: true
    this.allowMoving = acls.some(acl => acl.update);
  }
}
