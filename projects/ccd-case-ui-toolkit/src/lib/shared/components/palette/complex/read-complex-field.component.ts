import { Component, Input, OnInit } from '@angular/core';
import { CaseField, FieldType } from '../../../domain/definition';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';

@Component({
  selector: 'ccd-read-complex-field',
  templateUrl: './read-complex-field.html',
  standalone: false
})
export class ReadComplexFieldComponent extends AbstractFieldReadComponent implements OnInit {

  @Input()
  public caseFields: CaseField[] = [];

  public paletteContext = PaletteContext;

  public ngOnInit(): void {
    super.ngOnInit();
    this.caseField = this.caseFieldForDisplay();
    if (this.caseField.display_context_parameter) {
      this.context = PaletteContext.TABLE_VIEW;
    } else {
      // default to default views
      if (!this.caseField.display_context_parameter && this.context) {
        this.context = PaletteContext.DEFAULT;
      }
    }
    if (this.caseField?.field_type && this.caseField.field_type.complex_fields) {
      this.caseField?.field_type?.complex_fields?.forEach((field) => {
        if (field && this.caseField) {
          field.parent = this.caseField;
        }
        if (field?.isDynamic()) {
          field.list_items = this.caseField.value[field.id]?.list_items;
          field.value = {
            list_items: field.list_items,
            value: this.caseField.value[field.id]?.value && this.caseField.value[field.id].value?.code ?
              this.caseField.value[field.id].value.code :
              this.caseField.value[field.id]?.value
          };
        }
      });
    }
  }

  private caseFieldForDisplay(): CaseField {
    const selectedSubfieldPath = this.caseField?.caseFieldSubfieldCode?.trim();
    if (!selectedSubfieldPath || !this.caseField?.field_type?.complex_fields) {
      return this.caseField;
    }

    const path = selectedSubfieldPath.split('.').map((segment) => segment.trim()).filter(Boolean);
    if (path[0]?.toLowerCase() === this.caseField.id?.toLowerCase()) {
      path.shift();
    }
    if (!path.length) {
      return this.caseField;
    }

    const caseFieldWithSelectedSubfieldPath = this.cloneCaseFieldTree(this.caseField);
    let currentField = caseFieldWithSelectedSubfieldPath;
    for (const segment of path) {
      if (!currentField.isComplex() || currentField.isCollection()) {
        return this.caseField;
      }

      const selectedChild = currentField.field_type.complex_fields?.find(
        (field) => field.id?.toLowerCase() === segment.toLowerCase()
      );
      if (!selectedChild || selectedChild.isCollection()) {
        return this.caseField;
      }

      currentField.field_type.complex_fields = [selectedChild];
      currentField = selectedChild;
    }

    return caseFieldWithSelectedSubfieldPath;
  }

  private cloneCaseFieldTree(caseField: CaseField): CaseField {
    const clone = Object.assign(new CaseField(), caseField);
    clone.parent = undefined;
    if (caseField.field_type) {
      clone.field_type = this.cloneFieldTypeTree(caseField.field_type);
    }
    return clone;
  }

  private cloneFieldTypeTree(fieldType: FieldType): FieldType {
    const clone = Object.assign(new FieldType(), fieldType);
    clone.complex_fields = fieldType.complex_fields?.map((field) => this.cloneCaseFieldTree(field));
    clone.collection_field_type = fieldType.collection_field_type
      ? this.cloneFieldTypeTree(fieldType.collection_field_type)
      : undefined;
    return clone;
  }
}
