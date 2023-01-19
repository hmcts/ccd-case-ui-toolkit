import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CaseField } from '../../../domain/definition/case-field.model';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { WriteComplexFieldComponent } from '../complex/write-complex-field.component';
import { LinkedCasesService } from './services';

@Component({
  selector: 'ccd-write-case-link-field',
  templateUrl: 'write-case-link-field.html'
})

export class WriteCaseLinkFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  @Input()
  public caseFields: CaseField[] = [];

  @Input()
  public formGroup: FormGroup;

  public caseReferenceControl: AbstractControl;
  public caseLinkGroup: FormGroup;
  public containsCaseLinkCollection: boolean;
	public isWrite = true;

  @ViewChild('writeComplexFieldComponent', /* TODO: add static flag */ {})
  public writeComplexFieldComponent: WriteComplexFieldComponent;

  constructor(public readonly linkedCasesService: LinkedCasesService) {
    super();
  }

  public ngOnInit(): void {
    // Will be TRUE for new Case link/unlink journey
    this.containsCaseLinkCollection = this.hasCaseLinkCollection();

    if (!this.containsCaseLinkCollection) {
      if (this.caseField.value) {
        this.caseLinkGroup = this.registerControl(new FormGroup({
          CaseReference: new FormControl(this.caseField.value.CaseReference, Validators.required),
        }), true) as FormGroup;
      } else {
        this.caseLinkGroup = this.registerControl(new FormGroup({
          CaseReference: new FormControl(null, Validators.required),
        }), true) as FormGroup;
      }
      this.caseReferenceControl = this.caseLinkGroup.controls['CaseReference'];
      this.caseReferenceControl.setValidators(this.caseReferenceValidator());

      // Ensure that all sub-fields inherit the same value for retain_hidden_value as this parent; although a CaseLink
      // field uses the Complex type, it is meant to be treated as one field
      if (this.caseField && this.caseField.field_type.type === 'Complex') {
        for (const caseLinkSubField of this.caseField.field_type.complex_fields) {
          caseLinkSubField.retain_hidden_value = this.caseField.retain_hidden_value;
        }
      }
    }
  }

  private caseReferenceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (control.value) {
        if ( this.validCaseReference(control.value) ) {
          return null;
        }
        return {error: 'Please use a valid 16 Digit Case Reference'};
      } else {
        if (control.touched) {
          return {error: 'Please use a valid 16 Digit Case Reference'};
        }
      }
      return null;
    };
  }

  public validCaseReference(valueString: string): boolean {
    if (!valueString) {
      return false;
    }
    return new RegExp('^\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?\\d{4}\\b$').test(valueString.trim());
  }

  public hasCaseLinkCollection(): boolean {
    return (
      this.caseField.field_type &&
      this.caseField.field_type.type === 'Collection' &&
      this.caseField.field_type.collection_field_type.id === 'CaseLink' &&
      this.caseField.id === 'caseLinks'
    );
  }

  /**
   * This method is applicable only for new Case link/unlink journey
   */
  public submitLinkedCases(): void {
    const formGroup = this.formGroup;
    if (!this.linkedCasesService.isLinkedCasesEventTrigger) {
      const unlinkedCaseRefereneIds = this.linkedCasesService.linkedCases.filter(item => item.unlink).map(item => item.caseReference);
      this.formGroup.value.caseLinks = this.linkedCasesService.caseFieldValue
                                        .filter(item => unlinkedCaseRefereneIds.indexOf(item.id) === -1);
    } else if (formGroup.value && formGroup.value.caseLinks && this.linkedCasesService.linkedCases) {
      this.formGroup.value.caseLinks = this.linkedCasesService.caseFieldValue;
    }
  }
}
