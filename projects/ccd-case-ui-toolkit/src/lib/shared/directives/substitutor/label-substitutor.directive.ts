import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { PlaceholderService } from './services/placeholder.service';
import { CaseEventTrigger } from '../../domain';
import { WizardPage } from '../../components/case-editor/domain/wizard-page.model';
import { ShowCondition } from '../conditional-show';

@Directive({ selector: '[ccdLabelSubstitutor]' })
/**
 * Checks all labels and substitutes any placholders that reference other fields values.
 */
export class LabelSubstitutorDirective implements OnInit, OnDestroy {

  @Input() public caseField: CaseField;
  @Input() public contextFields: CaseField[] = [];
  @Input() public formGroup: FormGroup;
  @Input() public elementsToSubstitute: string[] = ['label', 'hint_text'];
  @Input() public eventTrigger: CaseEventTrigger;
  @Input() public triggeredFromEvent: boolean;

  private initialLabel: string;
  private initialHintText: string;

  constructor(
    private readonly fieldsUtils: FieldsUtils,
    private readonly placeholderService: PlaceholderService
  ) { }

  public ngOnInit(): void {
    this.initialLabel = this.caseField.label;
    this.initialHintText = this.caseField.hint_text;
    this.formGroup = this.formGroup || new FormGroup({});

    const fields: object = this.getReadOnlyAndFormFields();

    if (this.shouldSubstitute('label')) {
      this.caseField.label = this.resolvePlaceholders(fields, this.caseField.label);
    }
    if (this.shouldSubstitute('hint_text')) {
      this.caseField.hint_text = this.resolvePlaceholders(fields, this.caseField.hint_text);
    }
    if (this.shouldSubstitute('value')) {
      this.caseField.value = this.resolvePlaceholders(fields, this.caseField.value);
    }
  }

  public ngOnDestroy(): void {
    if (this.initialLabel) {
      this.caseField.label = this.initialLabel;
    }
    if (this.initialHintText) {
      this.caseField.hint_text = this.initialHintText;
    }
  }

  private shouldSubstitute(element: string): boolean {
    return this.elementsToSubstitute.find(e => e === element) !== undefined;
  }

  private getReadOnlyAndFormFields(): object {
    const formFields: object = this.getFormFieldsValuesIncludingDisabled();
    if (this.triggeredFromEvent) {
      const hiddenFields = this.listofHiddenCaseFields(this.formGroup, this.eventTrigger);
    }
    // TODO: Delete following line when @Input contextFields is fixed - https://tools.hmcts.net/jira/browse/RDM-3504
    const uniqueContextFields: CaseField[] = this.removeDuplicates(this.contextFields);
    return this.fieldsUtils.mergeLabelCaseFieldsAndFormFields(uniqueContextFields, formFields);
  }

  private listofHiddenCaseFields(form: FormGroup, eventTrigger: CaseEventTrigger): string[] {
    const currentEventState = this.fieldsUtils.mergeCaseFieldsAndFormFields(eventTrigger.case_fields, form.getRawValue());
    const hiddenCaseFieldsId: string[] = [];
    eventTrigger.wizard_pages.forEach(wp => {
      if (this.hasShowConditionPage(wp, currentEventState)) {
        const condition = new ShowCondition(wp.show_condition);
        if (this.isHidden(condition, currentEventState)) {
          wp.wizard_page_fields.forEach(wpf => {
            hiddenCaseFieldsId.push(wpf.case_field_id);
          });
        }
      }
    });
    return hiddenCaseFieldsId;
  }

  private findCommonCaseField(arr1, arr2) {

  }

  private hasShowConditionPage(wizardPage: WizardPage, formFields: any): boolean {
    return wizardPage.show_condition && formFields[this.getShowConditionKey(wizardPage.show_condition)];
  }

  private getShowConditionKey(showCondition: string): string {
    return showCondition.split(/!=|=|CONTAINS/)[0];
  }

  private isHidden(condition: ShowCondition, formFields: any): boolean {
    return !condition.match(formFields);
  }

  private removeDuplicates(original: CaseField[]): CaseField[] {
    const unique: CaseField[] = [];
    original.forEach(caseField => {
      const isUnique = unique.filter(e => e.id === caseField.id).length === 0;
      if (isUnique) {
        unique.push(caseField);
      }
    });
    return unique;
  }

  private getFormFieldsValuesIncludingDisabled(): object {
    return this.formGroup.getRawValue();
  }

  private resolvePlaceholders(fields: object, stringToResolve: string): string {
    return this.placeholderService.resolvePlaceholders(fields, stringToResolve);
  }
}
