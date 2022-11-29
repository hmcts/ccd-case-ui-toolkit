import { CaseField } from '../../domain/definition/case-field.model';
import { WriteAddressFieldComponent } from './address/write-address-field.component';
import { ReadCaseFlagFieldComponent } from './case-flag/read-case-flag-field.component';
import { WriteCaseFlagFieldComponent } from './case-flag/write-case-flag-field.component';
import { ReadCollectionFieldComponent } from './collection/read-collection-field.component';
import { WriteCollectionFieldComponent } from './collection/write-collection-field.component';
import { ReadComplexFieldComponent } from './complex/read-complex-field.component';
import { WriteComplexFieldComponent } from './complex/write-complex-field.component';
import { ReadDateFieldComponent } from './date/read-date-field.component';
import { WriteDateContainerFieldComponent } from './date/write-date-container-field.component';
import { ReadDocumentFieldComponent } from './document/read-document-field.component';
import { WriteDocumentFieldComponent } from './document/write-document-field.component';
import { ReadEmailFieldComponent } from './email/read-email-field.component';
import { WriteEmailFieldComponent } from './email/write-email-field.component';
import { ReadFixedListFieldComponent } from './fixed-list/read-fixed-list-field.component';
import { WriteFixedListFieldComponent } from './fixed-list/write-fixed-list-field.component';
import { ReadJudicialUserFieldComponent } from './judicial-user/read-judicial-user-field.component';
import { WriteJudicialUserFieldComponent } from './judicial-user/write-judicial-user-field.component';
import { ReadMoneyGbpFieldComponent } from './money-gbp/read-money-gbp-field.component';
import { WriteMoneyGbpFieldComponent } from './money-gbp/write-money-gbp-field.component';
import { ReadMultiSelectListFieldComponent } from './multi-select-list/read-multi-select-list-field.component';
import { WriteMultiSelectListFieldComponent } from './multi-select-list/write-multi-select-list-field.component';
import { ReadNumberFieldComponent } from './number/read-number-field.component';
import { WriteNumberFieldComponent } from './number/write-number-field.component';
import { ReadOrderSummaryFieldComponent } from './order-summary/read-order-summary-field.component';
import { WriteOrderSummaryFieldComponent } from './order-summary/write-order-summary-field.component';
import { PaletteService } from './palette.service';
import { CasePaymentHistoryViewerFieldComponent } from './payment/case-payment-history-viewer-field.component';
import { ReadPhoneUKFieldComponent } from './phone-uk/read-phone-uk-field.component';
import { WritePhoneUKFieldComponent } from './phone-uk/write-phone-uk-field.component';
import { ReadTextAreaFieldComponent } from './text-area/read-text-area-field.component';
import { WriteTextAreaFieldComponent } from './text-area/write-text-area-field.component';
import { ReadTextFieldComponent } from './text/read-text-field.component';
import { WriteTextFieldComponent } from './text/write-text-field.component';
import { UnsupportedFieldComponent } from './unsupported-field.component';
import { ReadYesNoFieldComponent } from './yes-no/read-yes-no-field.component';
import { WriteYesNoFieldComponent } from './yes-no/write-yes-no-field.component';

describe('PaletteService', () => {

  let paletteService: PaletteService;

  let assertComponent = function (type, write, component, fieldTypeId, collectionFieldTypeId?) {
    let caseField = new CaseField();
    if (collectionFieldTypeId) {
      caseField.field_type = { id: fieldTypeId, type: type, collection_field_type: { id: collectionFieldTypeId, type: type } };
    } else {
      caseField.field_type = { id: fieldTypeId, type: type };
    }
    expect(paletteService.getFieldComponentClass(caseField, write)).toBe(component);
  };

  beforeEach(() => {
    paletteService = new PaletteService();
  });

  describe('getFieldComponentClass', () => {

    it('should get UnsupportedField component class for unknown input', () => {
      assertComponent(null, false, UnsupportedFieldComponent, 'AnID');
    });

    it('should get ReadTextField component class for Text input', () => {
      assertComponent('Text', false, ReadTextFieldComponent, 'AnID');
    });

    it('should get WriteTextField component class for Text input', () => {
      assertComponent('Text', true, WriteTextFieldComponent, 'AnID');
    });

    it('should get ReadTextField component class for Postcode input', () => {
      assertComponent('Postcode', false, ReadTextFieldComponent, 'AnID');
    });

    it('should get WriteTextField component class for Postcode input', () => {
      assertComponent('Postcode', true, WriteTextFieldComponent, 'AnID');
    });

    it('should get ReadComplexField component class for ComplexType input', () => {
      assertComponent('Complex', false, ReadComplexFieldComponent, 'AnID');
    });

    it('should get WriteComplexField component class for Complex input', () => {
      assertComponent('Complex', true, WriteComplexFieldComponent, 'AnID');
    });

    it('should get ReadNumberField component class for Number input', () => {
      assertComponent('Number', false, ReadNumberFieldComponent, 'AnID');
    });

    it('should get WriteNumberField component class for Number input', () => {
      assertComponent('Number', true, WriteNumberFieldComponent, 'AnID');
    });

    it('should get ReadYesNoField component class for YesOrNo input', () => {
      assertComponent('YesOrNo', false, ReadYesNoFieldComponent, 'AnID');
    });

    it('should get WriteYesNoField component class for Text input', () => {
      assertComponent('YesOrNo', true, WriteYesNoFieldComponent, 'AnID');
    });

    it('should get ReadEmailField component class for Email input', () => {
      assertComponent('Email', false, ReadEmailFieldComponent, 'AnID');
    });

    it('should get WriteEmailField component class for Email input', () => {
      assertComponent('Email', true, WriteEmailFieldComponent, 'AnID');
    });

    it('should get ReadPhoneUKField component class for Phone UK input', () => {
      assertComponent('PhoneUK', false, ReadPhoneUKFieldComponent, 'AnID');
    });

    it('should get WritePhoneUKField component class for Phone UK input', () => {
      assertComponent('PhoneUK', true, WritePhoneUKFieldComponent, 'AnID');
    });

    it('should get ReadDateField component class for Date input', () => {
      assertComponent('Date', false, ReadDateFieldComponent, 'AnID');
    });

    it('should get WriteDateContainer component class for Date input', () => {
      assertComponent('Date', true, WriteDateContainerFieldComponent, 'AnID');
    });

    it('should get ReadDateTimeField component class for DateTime input', () => {
      assertComponent('DateTime', false, ReadDateFieldComponent, 'AnID');
    });

    it('should get WriteDateTimeContainer component class for DateTime input', () => {
      assertComponent('DateTime', true, WriteDateContainerFieldComponent, 'AnID');
    });

    it('should get ReadFixedListField component class for FixedList input', () => {
      assertComponent('FixedList', false, ReadFixedListFieldComponent, 'AnID');
    });

    it('should get WriteFixedListField component class for FixedList input', () => {
      assertComponent('FixedList', true, WriteFixedListFieldComponent, 'AnID');
    });

    it('should get ReadMoneyGbpField component class for MoneyGBP input', () => {
      assertComponent('MoneyGBP', false, ReadMoneyGbpFieldComponent, 'AnID');
    });

    it('should get WriteMoneyGbpField component class for MoneyGBP input', () => {
      assertComponent('MoneyGBP', true, WriteMoneyGbpFieldComponent, 'AnID');
    });

    it('should get ReadCollectionField component class for Collection input', () => {
      assertComponent('Collection', false, ReadCollectionFieldComponent, 'AnID', 'AnID');
    });

    it('should get WriteCollectionField component class for Collection input', () => {
      assertComponent('Collection', true, WriteCollectionFieldComponent, 'AnID', 'AnID');
    });

    it('should get ReadTextAreaField component class for TextArea input', () => {
      assertComponent('TextArea', false, ReadTextAreaFieldComponent, 'AnID');
    });

    it('should get WriteTextAreaField component class for TextArea input', () => {
      assertComponent('TextArea', true, WriteTextAreaFieldComponent, 'AnID');
    });

    it('should get ReadMultiSelectListField component class for MultiSelectList input', () => {
      assertComponent('MultiSelectList', false, ReadMultiSelectListFieldComponent, 'AnID');
    });

    it('should get WriteMultiSelectListField component class for MultiSelectList input', () => {
      assertComponent('MultiSelectList', true, WriteMultiSelectListFieldComponent, 'AnID');
    });

    it('should get ReadDocumentField component class for Document input', () => {
      assertComponent('Document', false, ReadDocumentFieldComponent, 'AnID');
    });

    it('should get WriteDocumentField component class for Document input', () => {
      assertComponent('Document', true, WriteDocumentFieldComponent, 'AnID');
    });

    it('should get ReadComplexFieldComponent component class for Complex field with AddressUK complex type', () => {
      assertComponent('Complex', false, ReadComplexFieldComponent, 'AddressUK');
    });

    it('should get WriteAddressFieldComponent component class for Complex field with AddressUK complex type', () => {
      assertComponent('Complex', true, WriteAddressFieldComponent, 'AddressUK');
    });

    it('should get ReadComplexFieldComponent component class for Complex field with AddressGlobalUK complex type', () => {
      assertComponent('Complex', false, ReadComplexFieldComponent, 'AddressGlobalUK');
    });

    it('should get WriteAddressFieldComponent component class for Complex field with AddressGlobalUK complex type', () => {
      assertComponent('Complex', true, WriteAddressFieldComponent, 'AddressGlobalUK');
    });

    it('should get ReadOrderSummaryFieldComponent component class for Complex field with OrderSummary complex type', () => {
      assertComponent('Complex', false, ReadOrderSummaryFieldComponent, 'OrderSummary');
    });

    it('should get WriteOrderSummaryFieldComponent component class for Complex field with OrderSummary complex type', () => {
      assertComponent('Complex', true, WriteOrderSummaryFieldComponent, 'OrderSummary');
    });

    it('should get ReadJudicialUserFieldComponent component class for Complex field with JudicialUser complex type', () => {
      assertComponent('Complex', false, ReadJudicialUserFieldComponent, 'JudicialUser');
    });

    it('should get WriteJudicialUserFieldComponent component class for Complex field with JudicialUser complex type', () => {
      assertComponent('Complex', true, WriteJudicialUserFieldComponent, 'JudicialUser');
    });

    it('should get CasePaymentHistoryViewerFieldComponent component class for CasePaymentHistoryViewer regardless of read/write', () => {
      assertComponent('CasePaymentHistoryViewer', true, CasePaymentHistoryViewerFieldComponent, 'AnID');
      assertComponent('CasePaymentHistoryViewer', false, CasePaymentHistoryViewerFieldComponent, 'AnID');
    });

    it('should get WriteCaseFlagFieldComponent component class for FlagLauncher input', () => {
      assertComponent('FlagLauncher', true, WriteCaseFlagFieldComponent, 'AnID');
    });

    it('should get ReadCaseFlagFieldComponent component class for FlagLauncher input', () => {
      assertComponent('FlagLauncher', false, ReadCaseFlagFieldComponent, 'AnID');
    });
  });
});
