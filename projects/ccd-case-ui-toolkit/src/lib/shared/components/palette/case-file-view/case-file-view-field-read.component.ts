import { Component } from '@angular/core';
import { CaseFileViewFieldComponent } from './case-file-view-field.component';

@Component({
  selector: 'ccd-case-file-view-field',
  templateUrl: './case-file-view-field.component.html',
  styleUrls: ['./case-file-view-field.component.scss'],
})
export class CaseFileViewFieldReadComponent extends CaseFileViewFieldComponent {
  public allowMoving = true;
}
