import { Component, Input } from '@angular/core';
import { CaseField } from '../../../domain';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

/**
 * Display a complex type fields as a list of values without labels.
 * This is intended for rendering of Check Your Answer page.
 */
@Component({
  selector: 'ccd-read-complex-field-raw',
  templateUrl: './read-complex-field-raw.html',
  styleUrls: [
    './read-complex-field-raw.scss'
  ],
  standalone: false
})
export class ReadComplexFieldRawComponent extends AbstractFieldReadComponent {
  // parent_ and value match the dummy path convention used by the table variant.
  public static readonly DUMMY_STRING_PRE = 'parent_';
  public static readonly DUMMY_STRING_POST = 'value';

  @Input()
  public caseFields: CaseField[] = [];

  public get path(): string {
    return ReadComplexFieldRawComponent.DUMMY_STRING_PRE + this.idPrefix + ReadComplexFieldRawComponent.DUMMY_STRING_POST;
  }
}
