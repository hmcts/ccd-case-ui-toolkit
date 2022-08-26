import { AfterContentChecked, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { plainToClassFromExist } from 'class-transformer';

import { CaseField } from '../../../domain/definition/case-field.model';
import { AbstractFieldReadComponent } from './abstract-field-read.component';

@Component({
  selector: 'ccd-field-read-label',
  templateUrl: './field-read-label.html',
  styleUrls: [
    './field-read-label.scss'
  ]
})
export class FieldReadLabelComponent extends AbstractFieldReadComponent implements OnChanges, AfterContentChecked {

  // EUI-3267. Flag for whether or not this can have a grey bar.
  public canHaveGreyBar = false;

  @Input()
  public withLabel: boolean;

  @Input()
  public markdownUseHrefAsRouterLink?: boolean;

  constructor(private readonly ref: ChangeDetectorRef) {
    super();
  }

  public ngAfterContentChecked(): void {
    this.ref.detectChanges();
  }

  public isLabel(): boolean {
    return this.caseField.field_type && this.caseField.field_type.type === 'Label';
  }

  public isComplex(): boolean {
    return this.caseField.isComplex();
  }

  public isCaseLink(): boolean {
    return this.caseField.isCaseLink();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const change = changes['caseField'];
    if (change) {
      const cfNew = change.currentValue;
      if (!(cfNew instanceof CaseField)) {
        this.fixCaseField();
      }

      // EUI-3267.
      // Set up the flag for whether this can have a grey bar.
      this.canHaveGreyBar = !!this.caseField.show_condition;
    }
  }

  private fixCaseField() {
    if (this.caseField && !(this.caseField instanceof CaseField)) {
      this.caseField = plainToClassFromExist(new CaseField(), this.caseField);
    }
  }
}
