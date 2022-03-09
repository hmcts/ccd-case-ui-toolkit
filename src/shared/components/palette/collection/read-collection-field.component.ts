import { Component, OnInit } from '@angular/core';

import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

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

  buildIdPrefix(index: number): string {
    const prefix = `${this.idPrefix}${this.caseField.id}_`;
    if (this.caseField.field_type.collection_field_type.type === 'Complex') {
      return `${prefix}${index}_`;
    }
    return prefix;
  }
}
