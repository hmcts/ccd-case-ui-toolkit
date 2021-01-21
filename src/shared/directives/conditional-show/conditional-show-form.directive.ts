import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { CaseField } from '../../domain/definition/case-field.model';
import { Subscription } from 'rxjs';
import { ShowCondition } from './domain';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { ConditionalShowRegistrarService } from './services/conditional-show-registrar.service';
import { GreyBarService } from './services/grey-bar.service';
import { AbstractFieldWriteComponent } from '../../components/palette/base-field/abstract-field-write.component';
import { AbstractFormFieldComponent } from '../../components/palette/base-field/abstract-form-field.component';

@Directive({ selector: '[ccdConditionalShowForm]' })
/** Hides and shows all fields in a form. Works on read only fields and form fields.
 *  The show condition is evaluated on all the fields of the page. i.e. read only and form fields.
 *  Evaluation of the show condition includes disabled fields, which can be on their initial value or empty. Executes on the
 *  host field initialization and when any field of the form changes.
 *  Collaborates with the GreyBarService to show a vertical grey bar when a field initially hidden on the page is shown. When returning
 *  to the page after the page has been left, the grey bar has to be redisplayed. If instead on initial page load the field renders as
 *  initially shown, the grey bar is not displayed.
 */
export class ConditionalShowFormDirective implements OnInit, OnDestroy {

  @Input() caseFields: CaseField[];
  @Input() contextFields: CaseField[] = [];
  @Input() formGroup: FormGroup;

  private allFieldValues: any;
  private formChangesSubscription: Subscription;

  constructor(private el: ElementRef,
              private fieldsUtils: FieldsUtils,
              private registry: ConditionalShowRegistrarService,
              private renderer: Renderer2,
              private greyBarService: GreyBarService) {
  }

  ngOnInit() {
    if (!this.formGroup) {
      console.log ('**** no form group in conditional-show-form directive');
      this.formGroup = new FormGroup({});
    }
    this.evalAllShowHideConditions();
    this.subscribeToFormChanges();
  }

  ngOnDestroy() {
    this.unsubscribeFromFormChanges();
  }

  private subscribeToFormChanges() {
    this.unsubscribeFromFormChanges();
    this.formChangesSubscription = this.formGroup.valueChanges.subscribe(_ => {
      this.evalAllShowHideConditions();
    });
  }

  private evaluateControl(control: AbstractControl) {
    const cf = control['caseField'] as CaseField;
    const component = control['component'] as AbstractFormFieldComponent;
    this.evaluateCondition(cf, component);
  }

  private evaluateCondition(cf: CaseField, component: AbstractFormFieldComponent) {
    if (cf) {
      if (cf.show_condition) {
        const condResult = ShowCondition.getInstance(cf.show_condition).match(this.allFieldValues, this.buildPath(component, cf));
        if (cf.hidden === null || cf.hidden === undefined) {
          cf.hidden = false;
        }
        if (condResult === cf.hidden) {
          if (cf.hidden) {
            this.greyBarService.addToggledToShow(cf.id);
          } else {
            this.greyBarService.removeToggledToShow(cf.id)
          }
          cf.hidden = !condResult;
        }
      }
    }
  }

  // make sure for the 3 callbacks that we are bound to this via an arrow function
  private handleFormControl = (c: FormControl) => {
    this.evaluateControl(c);
  }

  private handleFormArray = (c: FormArray, caseField: CaseField) => {
    this.evaluateControl(c);
    c.controls.forEach((formControl, ix) => {
      this.fieldsUtils.controlIterator(formControl, this.handleFormArray, this.handleFormGroup, this.handleFormControl)
   });
  }

  private handleFormGroup = (g: FormGroup) => {
    this.evaluateControl(g);
    let groupControl = null;
    if (g.get('value')) { // Complex Field
      groupControl = g.get('value') as FormGroup;
    } else if (g.controls) {
      // Special Fields like AddressUK, AddressGlobal
      groupControl = g;
    }
    Object.keys(groupControl.controls).forEach(cKey => {
      this.fieldsUtils.controlIterator(groupControl.get(cKey), this.handleFormArray, this.handleFormGroup, this.handleFormControl)
    });
  }

  private evalAllShowHideConditions() {
    this.getCurrentPagesReadOnlyAndFormFieldValues()
    this.fieldsUtils.controlIterator(this.formGroup, this.handleFormArray, this.handleFormGroup, this.handleFormControl)
  }

  private buildPath(c: AbstractFormFieldComponent, field: CaseField) {
    if (c && c instanceof AbstractFieldWriteComponent) {
      if (c.idPrefix) {
        return c.idPrefix + field.id;
      }
    }
    return field.id;
  }

  private getCurrentPagesReadOnlyAndFormFieldValues() {
    let formFields = this.getFormFieldsValuesIncludingDisabled();
    this.allFieldValues = this.fieldsUtils.mergeCaseFieldsAndFormFields(this.contextFields, formFields);
    return this.allFieldValues;
  }

  private getFormFieldsValuesIncludingDisabled() {
    return this.formGroup.getRawValue();
  }

  private unsubscribeFromFormChanges() {
    if (this.formChangesSubscription) {
      this.formChangesSubscription.unsubscribe();
    }
  }

  // TODO - remove or make work for a specific field
  private updateGreyBar(caseField: CaseField, shown: boolean) {
    if (shown) {
      this.greyBarService.addToggledToShow(caseField.id);
      this.greyBarService.showGreyBar(caseField, this.el);
    } else {
      this.greyBarService.removeToggledToShow(caseField.id);
      this.greyBarService.removeGreyBar(this.el);
    }
  }
}
