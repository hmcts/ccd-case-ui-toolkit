import { CaseField, FieldType } from '../domain/definition';
import { AccessControlList } from '../domain/definition/access-control-list.model';

export class CaseFieldBuilder {

  private readonly caseField: CaseField = new CaseField();
  public static create(): CaseFieldBuilder {
    return new CaseFieldBuilder();
  }

  public withACLs(acls: AccessControlList[]): CaseFieldBuilder {
    this.caseField.acls = acls;
    return this;
  }

  public withId(id: string): CaseFieldBuilder {
    this.caseField.id = id;
    return this;
  }

  public withFieldType(fieldType: FieldType): CaseFieldBuilder {
    this.caseField.field_type = fieldType;
    return this;
  }

  public withDisplayContext(displayContext: string): CaseFieldBuilder {
    this.caseField.display_context = displayContext;
    return this;
  }

  public withDisplayContextParameter(displayContextParameter: string): CaseFieldBuilder {
    this.caseField.display_context_parameter = displayContextParameter;
    return this;
  }

  public withHidden(hidden: boolean): CaseFieldBuilder {
    this.caseField.hidden = hidden;
    return this;
  }

  public withHintText(hintText: string): CaseFieldBuilder {
    this.caseField.hint_text = hintText;
    return this;
  }

  public withLabel(label: string): CaseFieldBuilder {
    this.caseField.label = label;
    return this;
  }

  public withOrder(order: number): CaseFieldBuilder {
    this.caseField.order = order;
    return this;
  }

  public withSecurityLabel(securityLabel: string): CaseFieldBuilder {
    this.caseField.security_label = securityLabel;
    return this;
  }

  public withShowCondition(showCondition: string): CaseFieldBuilder {
    this.caseField.show_condition = showCondition;
    return this;
  }

  public withShowSummaryContentOption(option: number): CaseFieldBuilder {
    this.caseField.show_summary_content_option = option;
    return this;
  }

  public withValue(value: any): CaseFieldBuilder {
    this.caseField.value = value;
    return this;
  }

  public withListValue(value: any): CaseFieldBuilder {
    this.caseField.list_items = value;
    return this;
  }

  public build(): CaseField {
    return this.caseField;
  }
}
