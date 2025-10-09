import { Component, Input, OnInit } from '@angular/core';
import { CaseField } from '../../../domain/definition';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
    selector: 'ccd-read-complex-field-table',
    templateUrl: './read-complex-field-table.html',
    styleUrls: ['./read-complex-field-table.scss'],
    standalone: false
})
export class ReadComplexFieldTableComponent extends AbstractFieldReadComponent implements OnInit {
  // parent_ can be replaced with any ***_ - underscore is only important character
  // value can also be replaced with anything
  public static readonly DUMMY_STRING_PRE = 'parent_';
  public static readonly DUMMY_STRING_POST = 'value';

  @Input()
  public caseFields: CaseField[] = [];

  public path: string;

  public ngOnInit(): void {
    this.setDummyPathForChildArrays();
  }

  /* In order to get child arrays (within casefield) to display their logic
    we need to add a path. This path needs to include the idPrefix as that
    is the part of the path that is used to display the elements.
    The joining strings will allow us to use the existing show condition to
    match against this path. */
  private setDummyPathForChildArrays(): void {
    this.path = ReadComplexFieldTableComponent.DUMMY_STRING_PRE + this.idPrefix + ReadComplexFieldTableComponent.DUMMY_STRING_POST;
  }
}
