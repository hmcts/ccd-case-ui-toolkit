import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

import { Constants } from '../../../commons/constants';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldsUtils, FormValidatorsService } from '../../../services';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { IsCompoundPipe } from '../utils/is-compound.pipe';

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

  constructor (private isCompoundPipe: IsCompoundPipe, private formValidatorsService: FormValidatorsService) {
    super();
    this.complexGroup = new FormGroup({});
  }

  ngOnInit(): void {
    // Add validators for the complex field.
    this.complexGroup = this.registerControl(this.complexGroup, true) as FormGroup;
    this.formValidatorsService.addValidators(this.caseField, this.complexGroup);
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
}
