import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { CaseField } from '../../domain/definition/case-field.model';
import { Subscription } from 'rxjs';
import { ShowCondition } from './domain/conditional-show.model';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { ConditionalShowRegistrarService } from './services/conditional-show-registrar.service';
import { GreyBarService } from './services/grey-bar.service';
import { debounceTime } from 'rxjs/operators';

@Directive({selector: '[ccdConditionalShow]'})
/** Hides and shows the host element based on the show condition if the condition is not empty. Works on read only fields and form fields.
 *  The show condition is evaluated on all the fields of the page. i.e. read only and form fields. When a form field is hidden, if its
 *  initial value was changed then the field is cleared. Otherwise the original value is kept and will display next time the field is
 *  shown. Evaluation of the show condition includes disabled fields, which can be on their initial value or empty. Executes on the
 *  host field initialization and when any field of the form changes.
 *  Collaborates with the GreyBarService to show a vertical grey bar when a field initially hidden on the page is shown. When returning
 *  to the page after the page has been left, the grey bar has to be redisplayed. If instead on initial page load the field renders as
 *  initially shown, the grey bar is not displayed.
 */
export class ConditionalShowDirective implements AfterViewInit, OnDestroy {

  @Input() caseField: CaseField;
  @Input() idPrefix: string;
  @Input() contextFields: CaseField[] = [];
  @Input() formGroup: FormGroup;
  @Input() greyBarEnabled = false;
  @Input() complexFormGroup: FormGroup;

  condition: ShowCondition;
  formField: any;
  formGroupRawValue: any;
  private formChangesSubscription: Subscription;

  constructor(private el: ElementRef,
              private fieldsUtils: FieldsUtils,
              private registry: ConditionalShowRegistrarService,
              private renderer: Renderer2,
              private greyBarService: GreyBarService) {
  }

  ngAfterViewInit() {
    // Ensure this.caseField is actually a CaseField instance even if instantiated with {}
    // this.caseField = FieldsUtils.convertToCaseField(this.caseField);
    if (this.caseField.show_condition) {
      this.condition = ShowCondition.getInstance(this.caseField.show_condition);
      this.formGroup = this.formGroup || new FormGroup({});
      this.complexFormGroup = this.complexFormGroup || new FormGroup({});
      this.formField = this.complexFormGroup.get(this.caseField.id) || this.formGroup.get(this.caseField.id);
      this.updateVisibility(this.getCurrentPagesReadOnlyAndFormFieldValues());
      if (this.greyBarEnabled && this.greyBarService.wasToggledToShow(this.caseField.id)) {
        this.greyBarService.showGreyBar(this.caseField, this.el);
      }
      this.subscribeToFormChanges();
      this.registry.register(this);
    }
  }

  refreshVisibility() {
    this.updateVisibility(this.getCurrentPagesReadOnlyAndFormFieldValues(), true);
    this.subscribeToFormChanges();
  }

  ngOnDestroy() {
    this.unsubscribeFromFormChanges();
  }

  private subscribeToFormChanges() {
    this.unsubscribeFromFormChanges();
    this.formChangesSubscription = this.formGroup
      .valueChanges
      .pipe(
        debounceTime(200)
      )
      .subscribe(_ => {
        let shown = this.updateVisibility(this.getCurrentPagesReadOnlyAndFormFieldValues());
        if (this.greyBarEnabled && shown !== undefined) {
          this.updateGreyBar(shown);
        }
      });
  }

  /**
   * returns whether the field visibility has changed, or undefined if not
   */
  private updateVisibility(fields, forced = false): boolean {
    if (this.shouldToggleToHide(fields, forced)) {
      this.onHide();
      return false;
    } else if (this.shouldToggleToShow(fields)) {
      this.onShow();
      return true;
    }
  }

  private onHide() {
    if (this.formField) {
      this.unsubscribeFromFormChanges();
      this.formField.disable({emitEvent: false});
      this.subscribeToFormChanges();
    }
    this.hideField();
    this.greyBarService.removeGreyBar(this.el);
  }

  private onShow() {
    if (this.formField) {
      this.unsubscribeFromFormChanges();
      this.formField.enable({emitEvent: false});
      this.subscribeToFormChanges();
    }
    this.showField();
    if (this.formField) {
      this.checkHideShowCondition(this.caseField.id, this.formField);
    }
  }

  private hideField() {
    this.el.nativeElement.hidden = true;
  }

  private showField() {
    this.el.nativeElement.hidden = false;
  }

  private shouldToggleToHide(fields, forced) {
    return (!this.isHidden() || forced) && !this.condition.match(fields, this.buildPath());
  }

  private shouldToggleToShow(fields) {
    return this.isHidden() && this.condition.match(fields, this.buildPath());
  }

  private buildPath() {
    if (this.idPrefix) {
      return this.idPrefix + this.caseField.id;
    }
    return this.caseField.id;
  }

  private getCurrentPagesReadOnlyAndFormFieldValues() {
    const formFields = this.getFormFieldsValuesIncludingDisabled();
    return this.fieldsUtils.mergeCaseFieldsAndFormFields(this.contextFields, formFields);
  }

  private getFormFieldsValuesIncludingDisabled() {
    if (this.formGroupRawValue) {
      return this.formGroupRawValue;
    }
    this.formGroupRawValue = this.formGroup.getRawValue();
    return this.formGroupRawValue;
  }

  private isHidden() {
    return this.el.nativeElement.hidden;
  }

  private unsubscribeFromFormChanges() {
    if (this.formChangesSubscription) {
      this.formChangesSubscription.unsubscribe();
    }
  }

  // TODO This must be extracted to a generic service for traversing see RDM-2233
  private checkHideShowCondition(key: string, aControl: AbstractControl) {
    if (aControl instanceof FormArray) {  // We're in a collection
      aControl.controls.forEach((formControl, i) => {
        this.checkHideShowCondition('' + i, formControl)
      });
    } else if (aControl instanceof FormGroup) {
      if (aControl.get('value')) { // Complex Field
        let complexControl = aControl.get('value') as FormGroup;
        Object.keys(complexControl.controls).forEach(controlKey => {
          this.checkHideShowCondition(controlKey, complexControl.get(controlKey));
        });
      } else if (aControl.controls) { // Special Field like AddressUK, AddressGlobal
        Object.keys(aControl.controls).forEach(controlKey => {
          this.checkHideShowCondition(controlKey, aControl.get(controlKey));
        })
      }
    } else if (aControl instanceof FormControl) {  // FormControl
      if (aControl.invalid) {
        this.registry.refresh();
      }
    }
  }

  private updateGreyBar(shown: boolean) {
    if (shown) {
      this.greyBarService.addToggledToShow(this.caseField.id);
      this.greyBarService.showGreyBar(this.caseField, this.el);
    } else {
      this.greyBarService.removeToggledToShow(this.caseField.id);
      this.greyBarService.removeGreyBar(this.el);
    }
  }
}
