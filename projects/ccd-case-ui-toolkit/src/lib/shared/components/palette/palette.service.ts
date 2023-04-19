import { Injectable, Type } from '@angular/core';
import { CaseField } from '../../domain/definition/case-field.model';
import { DisplayContextCustomParameter, DisplayContextParameter } from '../../domain/definition/display-context-enum.model';
import { WriteAddressFieldComponent } from './address/write-address-field.component';
import { CaseFileViewFieldComponent } from './case-file-view/case-file-view-field.component';
import { ReadCaseFlagFieldComponent } from './case-flag/read-case-flag-field.component';
import { WriteCaseFlagFieldComponent } from './case-flag/write-case-flag-field.component';
import { ReadCaseLinkFieldComponent } from './case-link/read-case-link-field.component';
import { WriteCaseLinkFieldComponent } from './case-link/write-case-link-field.component';
import { ReadCollectionFieldComponent } from './collection/read-collection-field.component';
import { WriteCollectionFieldComponent } from './collection/write-collection-field.component';
import { ReadComplexFieldComponent } from './complex/read-complex-field.component';
import { WriteComplexFieldComponent } from './complex/write-complex-field.component';
import { ReadDateFieldComponent } from './date/read-date-field.component';
import { WriteDateContainerFieldComponent } from './date/write-date-container-field.component';
import { ReadDocumentFieldComponent } from './document/read-document-field.component';
import { WriteDocumentFieldComponent } from './document/write-document-field.component';
import { ReadDynamicListFieldComponent } from './dynamic-list/read-dynamic-list-field.component';
import { WriteDynamicListFieldComponent } from './dynamic-list/write-dynamic-list-field.component';
import { ReadDynamicMultiSelectListFieldComponent, WriteDynamicMultiSelectListFieldComponent } from './dynamic-multi-select-list';
import { ReadDynamicRadioListFieldComponent } from './dynamic-radio-list/read-dynamic-radio-list-field.component';
import { WriteDynamicRadioListFieldComponent } from './dynamic-radio-list/write-dynamic-radio-list-field.component';
import { ReadEmailFieldComponent } from './email/read-email-field.component';
import { WriteEmailFieldComponent } from './email/write-email-field.component';
import { ReadFixedListFieldComponent } from './fixed-list/read-fixed-list-field.component';
import { WriteFixedListFieldComponent } from './fixed-list/write-fixed-list-field.component';
import { ReadFixedRadioListFieldComponent } from './fixed-radio-list/read-fixed-radio-list-field.component';
import { WriteFixedRadioListFieldComponent } from './fixed-radio-list/write-fixed-radio-list-field.component';
import { CaseHistoryViewerFieldComponent } from './history/case-history-viewer-field.component';
import { ReadJudicialUserFieldComponent } from './judicial-user/read-judicial-user-field.component';
import { WriteJudicialUserFieldComponent } from './judicial-user/write-judicial-user-field.component';
import { LabelFieldComponent } from './label/label-field.component';
import { ReadLinkedCasesFieldComponent, WriteLinkedCasesFieldComponent } from './linked-cases';
import { ReadMoneyGbpFieldComponent } from './money-gbp/read-money-gbp-field.component';
import { WriteMoneyGbpFieldComponent } from './money-gbp/write-money-gbp-field.component';
import { ReadMultiSelectListFieldComponent } from './multi-select-list/read-multi-select-list-field.component';
import { WriteMultiSelectListFieldComponent } from './multi-select-list/write-multi-select-list-field.component';
import { ReadNumberFieldComponent } from './number/read-number-field.component';
import { WriteNumberFieldComponent } from './number/write-number-field.component';
import { ReadOrderSummaryFieldComponent } from './order-summary/read-order-summary-field.component';
import { WriteOrderSummaryFieldComponent } from './order-summary/write-order-summary-field.component';
import { ReadOrganisationFieldComponent } from './organisation/read-organisation-field.component';
import { WriteOrganisationFieldComponent } from './organisation/write-organisation-field.component';
import { CasePaymentHistoryViewerFieldComponent } from './payment/case-payment-history-viewer-field.component';
import { ReadPhoneUKFieldComponent } from './phone-uk/read-phone-uk-field.component';
import { WritePhoneUKFieldComponent } from './phone-uk/write-phone-uk-field.component';
import { ReadTextAreaFieldComponent } from './text-area/read-text-area-field.component';
import { WriteTextAreaFieldComponent } from './text-area/write-text-area-field.component';
import { ReadTextFieldComponent } from './text/read-text-field.component';
import { WriteTextFieldComponent } from './text/write-text-field.component';
import { UnsupportedFieldComponent } from './unsupported-field.component';
import { WaysToPayFieldComponent } from './waystopay/waystopay-field.component';
import { ReadYesNoFieldComponent } from './yes-no/read-yes-no-field.component';
import { WriteYesNoFieldComponent } from './yes-no/write-yes-no-field.component';

@Injectable()
export class PaletteService {
  private readonly componentLauncherRegistry = {
    [DisplayContextCustomParameter.CaseFileView]: [CaseFileViewFieldComponent, CaseFileViewFieldComponent],
    [DisplayContextCustomParameter.LinkedCases]: [WriteLinkedCasesFieldComponent, ReadLinkedCasesFieldComponent]
  };

  public getFieldComponentClass(caseField: CaseField, write: boolean): Type<{}> {
    switch (caseField.field_type.type) {
      case 'Text':
      case 'Postcode':
        return write ? WriteTextFieldComponent : ReadTextFieldComponent;
      case 'TextArea':
        return write ? WriteTextAreaFieldComponent : ReadTextAreaFieldComponent;
      case 'Number':
        return write ? WriteNumberFieldComponent : ReadNumberFieldComponent;
      case 'YesOrNo':
        return write ? WriteYesNoFieldComponent : ReadYesNoFieldComponent;
      case 'Email':
        return write ? WriteEmailFieldComponent : ReadEmailFieldComponent;
      case 'PhoneUK':
        return write ? WritePhoneUKFieldComponent : ReadPhoneUKFieldComponent;
      case 'Date':
      case 'DateTime':
        return write ? WriteDateContainerFieldComponent : ReadDateFieldComponent;
      case 'MoneyGBP':
        return write ? WriteMoneyGbpFieldComponent : ReadMoneyGbpFieldComponent;
      case 'DynamicList':
        return write ? WriteDynamicListFieldComponent : ReadDynamicListFieldComponent;
      case 'FixedList':
        return write ? WriteFixedListFieldComponent : ReadFixedListFieldComponent;
      case 'DynamicRadioList':
        return write ? WriteDynamicRadioListFieldComponent : ReadDynamicRadioListFieldComponent;
      case 'DynamicMultiSelectList':
          return write ? WriteDynamicMultiSelectListFieldComponent : ReadDynamicMultiSelectListFieldComponent;
      case 'FixedRadioList':
        return write ? WriteFixedRadioListFieldComponent : ReadFixedRadioListFieldComponent;
      case 'Complex':
        switch (caseField.field_type.id) {
          case 'AddressGlobalUK':
          case 'AddressUK':
            return write ? WriteAddressFieldComponent : ReadComplexFieldComponent;
          case 'OrderSummary':
            return write ? WriteOrderSummaryFieldComponent : ReadOrderSummaryFieldComponent;
          case 'CaseLink':
            return write ? WriteCaseLinkFieldComponent : ReadCaseLinkFieldComponent;
          case 'Organisation':
            return write ? WriteOrganisationFieldComponent : ReadOrganisationFieldComponent;
          case 'JudicialUser':
            return write ? WriteJudicialUserFieldComponent : ReadJudicialUserFieldComponent;
          default:
            return write ? WriteComplexFieldComponent : ReadComplexFieldComponent;
        }
      case 'Collection':
        return write ? WriteCollectionFieldComponent : ReadCollectionFieldComponent;
      case 'MultiSelectList':
        return write ? WriteMultiSelectListFieldComponent : ReadMultiSelectListFieldComponent;
      case 'Document':
        return write ? WriteDocumentFieldComponent : ReadDocumentFieldComponent;
      case 'Label':
        return LabelFieldComponent;
      case 'CasePaymentHistoryViewer':
        return CasePaymentHistoryViewerFieldComponent;
      case 'CaseHistoryViewer':
        return CaseHistoryViewerFieldComponent;
      case 'WaysToPay':
        return WaysToPayFieldComponent;
      case 'ComponentLauncher':
        return this.getComponentLauncherComponent(caseField, write);
      case 'FlagLauncher':
        return write ? WriteCaseFlagFieldComponent : ReadCaseFlagFieldComponent;
      default:
        return UnsupportedFieldComponent;
    }
  }

  private getComponentLauncherComponent(caseField: CaseField, write: boolean): any {
    // Extract the value passed for #ARGUMENT(...) in the CaseField display_context_parameter and
    // delete the default entries and return the matching component from the componentLauncherRegistry
    const argumentValue = caseField?.display_context_parameter?.match(/#ARGUMENT\((.*?)\)/)[1];
    if (argumentValue) {
      const displayContextParameterArray = argumentValue.includes(',') ? argumentValue.split(',') : [argumentValue];
      const componentToRender = displayContextParameterArray.filter(displayContextParameter => {
        return !Object.values(DisplayContextParameter).find(displayContextParameterFromLookup => {
           return displayContextParameter === displayContextParameterFromLookup;
        });
      });
      if (componentToRender?.length > 0 && this.componentLauncherRegistry.hasOwnProperty(componentToRender[0])) {
        return this.componentLauncherRegistry[componentToRender[0]][write ? 0 : 1];
      }
    }
    return UnsupportedFieldComponent;
  }
}
