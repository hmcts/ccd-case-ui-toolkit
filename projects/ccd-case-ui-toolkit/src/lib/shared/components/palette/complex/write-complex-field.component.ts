import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { plainToClassFromExist } from 'class-transformer';
import { Constants } from '../../../commons/constants';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldsFilterPipe } from '../../../pipes/complex/fields-filter.pipe';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { FormValidatorsService } from '../../../services/form/form-validators.service';

import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { AbstractFormFieldComponent } from '../base-field/abstract-form-field.component';
import { IsCompoundPipe } from '../utils/is-compound.pipe';

const ADDRESS_FIELD_TYPES = [ 'AddressUK', 'AddressGlobalUK', 'AddressGlobal' ];

@Component({
  selector: 'ccd-write-complex-type-field',
  templateUrl: './write-complex-field.html',
  styleUrls: ['./read-complex-field-table.scss']
})
export class WriteComplexFieldComponent extends AbstractFieldWriteComponent implements OnInit {
  @Input()
  public caseFields: CaseField[] = [];

  @Input()
  public formGroup: FormGroup;

  public complexGroup: FormGroup;

  @Input()
  public renderLabel = true;

  @Input()
  public ignoreMandatory = false;

  public complexFields: CaseField[];

  constructor(private readonly isCompoundPipe: IsCompoundPipe, private readonly formValidatorsService: FormValidatorsService) {
    super();
    this.complexGroup = new FormGroup({});
  }

  public ngOnInit(): void {
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

  public buildField(caseField: CaseField): CaseField {
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

    // For Address-type fields, ensure that all sub-fields inherit the same value for retain_hidden_value as this
    // parent; although address fields use the Complex type, each of them is meant to be treated as one field
    if (this.isAddressUK() && this.caseField) {
      for (const addressSubField of this.caseField.field_type.complex_fields) {
        addressSubField.retain_hidden_value = this.caseField.retain_hidden_value;
      }
    }

    FieldsUtils.addCaseFieldAndComponentReferences(control, caseField, this);
    return caseField;
  }

  public buildIdPrefix(field: CaseField): string {
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
    return ADDRESS_FIELD_TYPES.indexOf(this.caseField.field_type.id) > -1;
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
        if (!(field instanceof CaseField)) {
          return this.buildField(plainToClassFromExist(new CaseField(), field));
        }
      }
      return this.buildField(field);
    });
  }
}
