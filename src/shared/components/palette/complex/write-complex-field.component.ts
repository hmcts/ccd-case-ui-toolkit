import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { plainToClassFromExist } from 'class-transformer';

import { Constants } from '../../../commons/constants';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldsUtils, FormValidatorsService } from '../../../services';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { AbstractFormFieldComponent } from '../base-field/abstract-form-field.component';
import { IsCompoundPipe } from '../utils/is-compound.pipe';
import { FieldsFilterPipe } from './fields-filter.pipe';

@Component({
  selector: 'ccd-write-complex-type-field',
  templateUrl: './write-complex-field.html',
  styleUrls: ['./read-complex-field-table.scss']
})
export class WriteComplexFieldComponent extends AbstractFieldWriteComponent implements OnInit {
  @Input()
  caseFields: CaseField[] = [];

  @Input()
  formGroup: FormGroup;

  complexGroup: FormGroup;

  @Input()
  renderLabel = true;

  @Input()
  ignoreMandatory = false;

  public complexFields: CaseField[];

  constructor (private isCompoundPipe: IsCompoundPipe, private formValidatorsService: FormValidatorsService) {
    super();
    this.complexGroup = new FormGroup({});
  }

  ngOnInit(): void {
    // Are we inside of a collection? If so, the parent is the complexGroup we want.
    if (this.isTopLevelWithinCollection()) {
      this.complexGroup = this.parent as FormGroup;
      FieldsUtils.addCaseFieldAndComponentReferences(this.complexGroup, this.caseField, this);
    } else {
      this.complexGroup = this.registerControl(this.complexGroup, true) as FormGroup;
    }
    // Add validators for the complex field.
    this.formValidatorsService.addValidators(this.caseField, this.complexGroup);
    this.setupFields();
    this.complexGroup.updateValueAndValidity({ emitEvent: true });
  }

  buildField(caseField: CaseField): CaseField {
    let control: AbstractControl = this.complexGroup.get(caseField.id);
    if (!control) {
      control = new FormControl(caseField.value);
      this.complexGroup.addControl(caseField.id, control);
    }

    // Add validators for addresses, if appropriate.
    if (this.isAddressUK()) {
      if (this.addressValidatorsRequired(caseField)) {
        this.formValidatorsService.addValidators(caseField, control);
      }
    } else {
      // It's not an address so set it up according to its own display_context.
      this.formValidatorsService.addValidators(caseField, control);
    }
    FieldsUtils.addCaseFieldAndComponentReferences(control, caseField, this);
    return caseField;
  }

  buildIdPrefix(field: CaseField): string {
    return this.isCompoundPipe.transform(field) ? `${this.idPrefix}${field.id}_` : `${this.idPrefix}`;
  }

  private addressValidatorsRequired(caseField: CaseField): boolean {
    return this.isSmallAddressLine1(caseField) && this.isMandatory(caseField);
  }

  private isSmallAddressLine1(caseField: CaseField): boolean {
    return caseField.id === 'AddressLine1' && caseField.field_type.id === 'TextMax150';
  }

  private isMandatory(caseField: CaseField): boolean {
    return (Constants.MANDATORY === caseField.display_context || !this.ignoreMandatory);
  }

  private isAddressUK(): boolean {
    return this.caseField.field_type.id === 'AddressUK';
  }

  private isTopLevelWithinCollection(): boolean {
    if (this.parent) {
      const parentCaseField: CaseField = this.parent['caseField'];
      if (parentCaseField && parentCaseField.id === this.caseField.id) {
        const parentComponent = this.parent['component'] as AbstractFormFieldComponent;
        if (parentComponent) {
          const parentComponentCaseField = parentComponent.caseField;
          if (parentComponentCaseField.field_type) {
            return parentComponentCaseField.field_type.type === 'Collection';
          }
        }
      }
    }
    return false;
  }

  private setupFields(): void {
    const fieldsFilterPipe: FieldsFilterPipe = new FieldsFilterPipe();
    this.complexFields = fieldsFilterPipe.transform(this.caseField, true).map(field => {
      if (field && field.id) {
        const id = field.id;
        if (!(field instanceof CaseField)) {
          return this.buildField(plainToClassFromExist(new CaseField(), field));
        }
      }
      return this.buildField(field);
    });
  }
}
