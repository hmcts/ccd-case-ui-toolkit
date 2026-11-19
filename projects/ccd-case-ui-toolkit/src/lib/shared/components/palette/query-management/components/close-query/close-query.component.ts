import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'ccd-close-query',
  templateUrl: './close-query.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class CloseQueryComponent {
  @Input() public formGroup: FormGroup;
}
