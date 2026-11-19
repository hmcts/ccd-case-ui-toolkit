import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-money-gbp-field',
  templateUrl: './write-money-gbp-field.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class WriteMoneyGbpFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  public moneyGbpControl: FormControl;

  public ngOnInit() {
    this.moneyGbpControl = this.registerControl(new FormControl(this.caseField.value)) as FormControl;
  }
}
