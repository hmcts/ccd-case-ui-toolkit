import { CaseField, FieldType } from '../domain/definition';
import { AccessControlList } from '../domain/definition/access-control-list.model';

export class CaseFieldBuilder {
  private caseField: CaseField = new CaseField();

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

  public withFieldType(field_type: FieldType): CaseFieldBuilder {
    this.caseField.field_type = field_type;
    return this;
  }

  public withDisplayContext(display_context: string): CaseFieldBuilder {
    this.caseField.display_context = display_context;
    return this;
  }

  public withDisplayContextParameter(display_context_parameter: string): CaseFieldBuilder {
    this.caseField.display_context_parameter = display_context_parameter;
    return this;
  }

  public withHidden(hidden: boolean): CaseFieldBuilder {
    this.caseField.hidden = hidden;
    return this;
  }

  public withHintText(hint_text: string): CaseFieldBuilder {
    this.caseField.hint_text = hint_text;
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

  public withSecurityLabel(security_label: string): CaseFieldBuilder {
    this.caseField.security_label = security_label;
    return this;
  }

  public withShowCondition(show_condition: string): CaseFieldBuilder {
    this.caseField.show_condition = show_condition;
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
