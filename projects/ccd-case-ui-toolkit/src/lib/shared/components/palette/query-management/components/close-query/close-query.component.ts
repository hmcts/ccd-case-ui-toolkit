import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'ccd-close-query',
  templateUrl: './close-query.component.html'
})
export class CloseQueryComponent {
  @Input() public formGroup: FormGroup;
}
