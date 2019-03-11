import { Injectable, Type } from '@angular/core';
import { ReadTextFieldComponent } from './text/read-text-field.component';
import { ReadTextAreaFieldComponent } from './text-area/read-text-area-field.component';
import { ReadComplexFieldComponent } from './complex/read-complex-field.component';
import { ReadNumberFieldComponent } from './number/read-number-field.component';
import { ReadYesNoFieldComponent } from './yes-no/read-yes-no-field.component';
import { ReadEmailFieldComponent } from './email/read-email-field.component';
import { ReadPhoneUKFieldComponent } from './phone-uk/read-phone-uk-field.component';
import { ReadDateFieldComponent } from './date/read-date-field.component';
import { ReadFixedListFieldComponent } from './fixed-list/read-fixed-list-field.component';
import { ReadMoneyGbpFieldComponent } from './money-gbp/read-money-gbp-field.component';
import { WriteTextFieldComponent } from './text/write-text-field.component';
import { UnsupportedFieldComponent } from './unsupported-field.component';
import { ReadCollectionFieldComponent } from './collection/read-collection-field.component';
import { WriteComplexFieldComponent } from './complex/write-complex-field.component';
import { WritePhoneUKFieldComponent } from './phone-uk/write-phone-uk-field.component';
import { WriteNumberFieldComponent } from './number/write-number-field.component';
import { WriteYesNoFieldComponent } from './yes-no/write-yes-no-field.component';
import { WriteEmailFieldComponent } from './email/write-email-field.component';
import { WriteCollectionFieldComponent } from './collection/write-collection-field.component';
import { WriteFixedListFieldComponent } from './fixed-list/write-fixed-list-field.component';
import { WriteMoneyGbpFieldComponent } from './money-gbp/write-money-gbp-field.component';
import { WriteTextAreaFieldComponent } from './text-area/write-text-area-field.component';
import { ReadMultiSelectListFieldComponent } from './multi-select-list/read-multi-select-list-field.component';
import { WriteMultiSelectListFieldComponent } from './multi-select-list/write-multi-select-list-field.component';
import { WriteDateFieldComponent } from './date/write-date-field.component';
import { ReadDocumentFieldComponent } from './document/read-document-field.component';
import { WriteDocumentFieldComponent } from './document/write-document-field.component';
import { LabelFieldComponent } from './label/label-field.component';
import { WriteAddressFieldComponent } from './address/write-address-field.component';
import { CaseField } from '../../domain/definition/case-field.model';
import { WriteOrderSummaryFieldComponent } from './order-summary/write-order-summary-field.component';
import { ReadOrderSummaryFieldComponent } from './order-summary/read-order-summary-field.component';
import { CasePaymentHistoryViewerFieldComponent } from './payment/case-payment-history-viewer-field.component';
import { ReadCaseLinkFieldComponent } from './case-link/read-case-link-field.component';
import { WriteCaseLinkFieldComponent } from './case-link/write-case-link-field.component';
import { WriteFixedRadioListFieldComponent, ReadFixedRadioListFieldComponent } from './fixed-radio-list';
import { CaseHistoryViewerFieldComponent } from './history';

@Injectable()
export class PaletteService {

  getFieldComponentClass(caseField: CaseField, write: boolean): Type<{}> {
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
        return write ? WriteDateFieldComponent : ReadDateFieldComponent;
      case 'MoneyGBP':
        return write ? WriteMoneyGbpFieldComponent : ReadMoneyGbpFieldComponent;
      case 'FixedList':
        return write ? WriteFixedListFieldComponent : ReadFixedListFieldComponent;
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
      default:
        return UnsupportedFieldComponent;
    }
  }
}
