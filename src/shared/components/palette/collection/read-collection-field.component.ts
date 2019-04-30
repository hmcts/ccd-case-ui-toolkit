import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ccd-read-collection-field',
  templateUrl: './read-collection-field.html',
  styleUrls: ['./collection-field.scss']
})
export class ReadCollectionFieldComponent extends AbstractFieldReadComponent implements OnInit {

  public isDisplayContextParameterAvailable = false;

  ngOnInit(): void {
      if (this.caseField.display_context_parameter && this.caseField.display_context_parameter.trim().startsWith('#TABLE(')) {
        this.isDisplayContextParameterAvailable = true;
      }
  }
}
