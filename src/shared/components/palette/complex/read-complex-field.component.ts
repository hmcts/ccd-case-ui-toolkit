import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';
import { CaseField } from '../../../domain/definition';

@Component({
  selector: 'ccd-read-complex-field',
  templateUrl: './read-complex-field.html',
})
export class ReadComplexFieldComponent extends AbstractFieldReadComponent implements OnInit {

  public static readonly FIELD_TYPE_DYNAMIC_LIST = 'DynamicList';

  @Input()
  caseFields: CaseField[] = [];

  public paletteContext = PaletteContext;

  ngOnInit(): void {
    super.ngOnInit();
    if (this.caseField.display_context_parameter) {
      this.context = PaletteContext.TABLE_VIEW;
    }
    if (this.caseField.field_type) {
      this.caseField.field_type.complex_fields.map(field => {
        if (field.field_type.type === ReadComplexFieldComponent.FIELD_TYPE_DYNAMIC_LIST) {
          field.list_items = this.caseField.value[field.id].list_items;
          field.value = {
            list_items: field.list_items,
            value: this.caseField.value[field.id].value
          };
        }
      });
    }
  }

}
