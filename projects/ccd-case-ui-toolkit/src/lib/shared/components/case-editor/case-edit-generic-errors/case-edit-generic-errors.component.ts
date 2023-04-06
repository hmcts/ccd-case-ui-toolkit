import { Component, Input } from '@angular/core';

import { HttpError } from '../../../domain';

@Component({
  selector: 'ccd-case-edit-generic-errors',
  templateUrl: 'case-edit-generic-errors.component.html',
  styleUrls: ['../case-edit.scss'],
  providers: []
})
export class CaseEditGenericErrorsComponent {
  @Input() public error: HttpError;
}
