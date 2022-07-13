import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CaseField, FieldType } from '../../../domain/definition/case-field.model';
import { CaseEditPageComponent } from '../../case-editor/case-edit-page/case-edit-page.component';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { WriteComplexFieldComponent } from '../complex/write-complex-field.component';
import { LinkedCasesEventTriggers } from './enums';
import { LinkedCasesService } from './services';

@Component({
  selector: 'ccd-write-case-link-field',
  templateUrl: 'write-case-link-field.html'
})

export class WriteCaseLinkFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  @Input()
  caseFields: CaseField[] = [];

  @Input()
  formGroup: FormGroup;

  formArray: FormArray;

  @Input()
  public caseEditPageComponent: CaseEditPageComponent;

  caseReferenceControl: AbstractControl;
  caseLinkGroup: FormGroup;
  containsCaseLinkCollection: boolean;

  @ViewChild('writeComplexFieldComponent')
  writeComplexFieldComponent: WriteComplexFieldComponent;
  
  // @ViewChildren('collectionItem')
  // private items: QueryList<ElementRef>;
  // private collItems: CollectionItem[] = [];


  constructor(private router: Router,
    private readonly linkedCasesService: LinkedCasesService) {
    super();
  }

  public ngOnInit(): void {
    this.formArray = this.registerControl(new FormArray([]), true) as FormArray;
    this.formArray['caseField'] = this.caseField;
    this.caseField.value.forEach((item: any, index: number) => {
      const caseField = this.buildCaseField(item, index);
    })
    if (!this.hasCaseLinkCollection()) {
      this.caseLinkGroup = this.registerControl(new FormGroup({
        'CaseReference': new FormControl(this.caseField.value.CaseReference, Validators.required),
      }), true) as FormGroup;
    } else {
      // this.caseLinkGroup = this.registerControl(new FormGroup({
      //   'CaseReference': new FormControl(null, Validators.required),
      // }), true) as FormGroup;
      
    }
    // this.caseReferenceControl = this.caseLinkGroup.controls['CaseReference'];
    // this.caseReferenceControl.setValidators(this.caseReferenceValidator());

    // Ensure that all sub-fields inherit the same value for retain_hidden_value as this parent; although a CaseLink
    // field uses the Complex type, it is meant to be treated as one field
    if (this.caseField && this.caseField.field_type.type === 'Complex') {
      for (const caseLinkSubField of this.caseField.field_type.complex_fields) {
        caseLinkSubField.retain_hidden_value = this.caseField.retain_hidden_value;
      }
    }
    this.containsCaseLinkCollection = this.hasCaseLinkCollection();
  }

  private getContainer(index: number): FormGroup {
    const value = this.formArray.at(index).get('value');
    if (value instanceof FormGroup) {
      return value;
    } else {
      return this.formArray.at(index) as FormGroup;
    }
  }

  buildCaseField(item, index: number, isNew = false) {

    let group: FormGroup;
    if (this.formArray && (index < this.formArray.length)) {
      group = this.formArray.at(index) as FormGroup;
    } else {
      group = new FormGroup({});
    }

    let value;
      value = group.get('value') as FormGroup;
      if (!value) {
        value = new FormGroup({});
        for (const key of Object.keys(group.controls)) {
          value.addControl(key, group.get(key));
          // DON'T remove the control for this key from the outer group or it
          // goes awry. So DON'T uncomment the below line!
          // group.removeControl(key);
        }
        // Now add the value FormGroup to the outer group.
        group.addControl('value', value);
      }
    let id = group.get('id') as FormControl;
    // If we're not in scenario 3, above, we need to do some jiggery pokery
    // and set up the id and value controls.
    // Also set up an id control if it doesn't yet exist.
    if (!id) {
      id = new FormControl(item.id);
      group.addControl('id', id);
    }

    // Now, add the outer group to the array (or replace it).
    if (index < this.formArray.length) {
      this.formArray.setControl(index, group);
    } else {
      this.formArray.push(group);
    }
  }

  public submitLinkedCases(): void {
    //this.caseReferenceControl.setValue(this.linkedCasesService.linkedCases.map((caseInfo) => caseInfo.caseReference)[0]);
    if (this.formGroup.value.caseLinks && this.linkedCasesService.linkedCases) {
      this.formGroup.value.caseLinks = this.linkedCasesService.caseFieldValue;
      //this.formGroup.value.caseLinks.push(this.linkedCasesService.linkedCases);
    }
  }

  private caseReferenceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (control.value) {
        if (this.validCaseReference(control.value)) {
          return null;
        }
        return { 'error': 'Please use a valid 16 Digit Case Reference' };
      } else {
        if (control.touched) {
          return { 'error': 'Please use a valid 16 Digit Case Reference' };
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
      this.caseField.field_type.collection_field_type.id === 'CaseLink'
    );
  }

  public isLinkedCasesEventTrigger(): boolean {
    return this.caseEditPageComponent.eventTrigger.name === LinkedCasesEventTriggers.LINK_CASES;
  }
}
