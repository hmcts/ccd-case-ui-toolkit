import { AbstractFormFieldComponent } from '../base-field/abstract-form-field.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ccd-write-date-container-field',
  templateUrl: './write-date-container-field.html'
})
export class WriteDateFieldContainerComponent extends AbstractFormFieldComponent implements OnInit {

  ngOnInit(): void {
  }
}
