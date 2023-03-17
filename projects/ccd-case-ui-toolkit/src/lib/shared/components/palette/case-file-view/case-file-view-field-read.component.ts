import { Component, OnInit } from '@angular/core';
import { CaseField } from '../../../domain';
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
    this.allowMoving = this.caseField.acls.some(acl => acl.update);
  }
}
