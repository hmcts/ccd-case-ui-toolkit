import { AfterViewInit, Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { AbstractFieldWriteComponent } from '../../components/palette/base-field/abstract-field-write.component';
import { AbstractFormFieldComponent } from '../../components/palette/base-field/abstract-form-field.component';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { ShowCondition } from './domain';

@Directive({ selector: '[ccdConditionalShowForm]' })
/** Hides and shows all fields in a form. Works on read only fields and form fields.
 *  The show condition is evaluated on all the fields of the page. i.e. read only and form fields.
 *  Evaluation of the show condition includes disabled fields, which can be on their initial value or empty. Executes on the
 *  host field initialization and when any field of the form changes.
 *  Collaborates with the GreyBarService to show a vertical grey bar when a field initially hidden on the page is shown. When returning
 *  to the page after the page has been left, the grey bar has to be redisplayed. If instead on initial page load the field renders as
 *  initially shown, the grey bar is not displayed.
 */
export class ConditionalShowFormDirective implements OnInit, AfterViewInit, OnDestroy {

  @Input() caseFields: CaseField[];
  @Input() contextFields: CaseField[] = [];
  @Input() formGroup: FormGroup;

  private allFieldValues: any;
  private formChangesSubscription: Subscription;

  constructor(private readonly fieldsUtils: FieldsUtils) {
  }

  ngOnInit() {
    if (!this.formGroup) {
      this.formGroup = new FormGroup({});
    }
  }

  /**
   * Moved the evaluation of show/hide conditions and subscription
   * to form changes until after the form has been fully created.
   *
   * Prior to this change, I traced more than 5,100,000 firings of
   * the evaluateCondition INSIDE the show_condition check on page
   * load for an event with a lot of content. After this change,
   * that number dropped to fewer than 2,500 - that's a.
   */
  ngAfterViewInit() {
    this.evalAllShowHideConditions();
    this.subscribeToFormChanges();
  }

  ngOnDestroy() {
    this.unsubscribeFromFormChanges();
  }

  /*
  * Delay the execution of evalShowHideConditions for 500ms
  * Evaluating showHideConditions on input is inefficient as all forms are evaluated
  * whilst the user is still typing. We are better off allowing the user to finish typing
  * then evaluate the show hide conditions.
  */
  private subscribeToFormChanges() {
    this.unsubscribeFromFormChanges();
    this.formChangesSubscription = this.formGroup.valueChanges
      .pipe(
        debounceTime(500)
      )
      .subscribe(_ => {
      this.evalAllShowHideConditions();
    });
  }

  private evaluateControl(control: AbstractControl) {
    const cf = control['caseField'] as CaseField;
    const component = control['component'] as AbstractFormFieldComponent;
    this.evaluateCondition(cf, component, control);
  }

  private evaluateCondition(cf: CaseField, component: AbstractFormFieldComponent, control: AbstractControl) {
    if (cf) {
      if (cf.display_context === 'HIDDEN') {
        cf.hidden = true; // display_context === 'HIDDEN' means always hide
      } else if (cf.show_condition) {
        const showCondition: ShowCondition = ShowCondition.getInstance(cf.show_condition);
        const condResult = showCondition.match(this.allFieldValues, this.buildPath(component, cf));
        if (cf.hidden === null || cf.hidden === undefined) {
          cf.hidden = false;
        }
        if (condResult === cf.hidden) {
          cf.hidden = !condResult;
        }
        // EUI-3267. If this field is showing, set the hiddenCannotChange flag.
        // This is used in the display of the grey bar.
        if (!cf.hidden) {
          cf.hiddenCannotChange = showCondition.hiddenCannotChange(this.caseFields);
        }
        // Disable the control if it's hidden so that it doesn't count towards the
        // validation state of the form, but only if it's actually being validated.
        if (control.validator) {
          if (cf.hidden === true && !control.disabled) {
            control.disable({ emitEvent: false });
          } else if (cf.hidden !== true && control.disabled) {
            control.enable({ emitEvent: false });
          }
        }
      }
    }
  }

  // make sure for the 3 callbacks that we are bound to this via an arrow function
  private handleFormControl = (c: FormControl): void => {
    this.evaluateControl(c);
  }

  private handleFormArray = (a: FormArray): void => {
    this.evaluateControl(a);
    a.controls.forEach(formControl => {
      this.fieldsUtils.controlIterator(formControl, this.handleFormArray, this.handleFormGroup, this.handleFormControl);
   });
  }

  private handleFormGroup = (g: FormGroup): void => {
    this.evaluateControl(g);
    let groupControl = g;
    if (g.get('value') && g.get('value') instanceof FormGroup) { // Complex Field
      groupControl = g.get('value') as FormGroup;
    } else if (g.controls) {
      // Special Fields like AddressUK, AddressGlobal
      groupControl = g;
    }
    if (groupControl.controls) {
      Object.keys(groupControl.controls).forEach(cKey => {
        // EUI-3359.
        // Get the control from groupControl.controls[cKey] rather than
        // groupControl.get(cKey) as the latter does pathing and will interpret
        // full stops in cKey as delimeters for being nested within an array,
        // which makes no sense in this situation.
        const control = groupControl.controls[cKey];
        this.fieldsUtils.controlIterator(control, this.handleFormArray, this.handleFormGroup, this.handleFormControl);
      });
    }
  }

  private evalAllShowHideConditions(): void {
    this.getCurrentPagesReadOnlyAndFormFieldValues();
    this.fieldsUtils.controlIterator(this.formGroup, this.handleFormArray, this.handleFormGroup, this.handleFormControl);
  }

  private buildPath(c: AbstractFormFieldComponent, field: CaseField): string {
    if (c && c instanceof AbstractFieldWriteComponent) {
      if (c.idPrefix) {
        return c.idPrefix + field.id;
      }
    }
    return field.id;
  }

  private getCurrentPagesReadOnlyAndFormFieldValues(): any {
    let formFields = this.getFormFieldsValuesIncludingDisabled();
    this.allFieldValues = this.fieldsUtils.mergeCaseFieldsAndFormFields(this.contextFields, formFields);
    return this.allFieldValues;
  }

  private getFormFieldsValuesIncludingDisabled(): any {
    return this.formGroup.getRawValue();
  }

  private unsubscribeFromFormChanges(): void {
    if (this.formChangesSubscription) {
      this.formChangesSubscription.unsubscribe();
    }
  }
}
