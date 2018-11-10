import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadTextFieldComponent } from './text/read-text-field.component';
import { PaletteService } from './palette.service';
import { ReadNumberFieldComponent } from './number/read-number-field.component';
import { ReadEmailFieldComponent } from './email/read-email-field.component';
import { ReadPhoneUKFieldComponent } from './phone-uk/read-phone-uk-field.component';
import { ReadDateFieldComponent } from './date/read-date-field.component';
import { FixedListModule } from './fixed-list/fixed-list.module';
import { YesNoModule } from './yes-no/yes-no.module';
import { ComplexModule } from './complex/complex.module';
import { AddressModule } from './address/address.module';
import { BaseFieldModule } from './base-field/base-field.module';
import { WriteTextFieldComponent } from './text/write-text-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UnsupportedFieldComponent } from './unsupported-field.component';
import { ReadCollectionFieldComponent } from './collection/read-collection-field.component';
import { PaletteUtilsModule } from './utils/utils.module';
import { WritePhoneUKFieldComponent } from './phone-uk/write-phone-uk-field.component';
import { WriteEmailFieldComponent } from './email/write-email-field.component';
import { WriteCollectionFieldComponent } from './collection/write-collection-field.component';
import { WriteNumberFieldComponent } from './number/write-number-field.component';
import { MoneyGbpModule } from './money-gbp/money-gbp.module';
import { ReadTextAreaFieldComponent } from './text-area/read-text-area-field.component';
import { WriteTextAreaFieldComponent } from './text-area/write-text-area-field.component';
import { MultiSelectListModule } from './multi-select-list/multi-select-list.module';
import { WriteDateFieldComponent } from './date/write-date-field.component';
import { DocumentModule } from './document/document.module';
import { MarkdownModule } from '../markdown/markdown.module';
import { FormValidatorsService } from '../form/form-validators.service';
import { OrderSummaryModule } from './order-summary/order-summary.module';
import { CasePaymentHistoryViewerModule } from './payment/case-payment-history-viewer.module';
import { SharedUtilsModule } from '../utils/shared-utils.module';
import { BannersModule } from '../../components/banners/banners.module';
import { HeadersModule } from '../../headers.module';
import { FootersModule } from '../../footers.module';
import { BodyModule } from '../../body.module';
import { FormModule } from '../../components/form/form.module';
import { TabsModule } from '../../components/tabs/tabs.module';
import { FixedRadioListModule } from './fixed-radio-list';

@NgModule({
  imports: [
    CommonModule,
    BaseFieldModule,
    FixedListModule,
    FixedRadioListModule,
    YesNoModule,
    ComplexModule,
    MultiSelectListModule,
    MoneyGbpModule,
    ReactiveFormsModule,
    PaletteUtilsModule,
    DocumentModule,
    AddressModule,
    MarkdownModule,
    OrderSummaryModule,
    CasePaymentHistoryViewerModule,
    SharedUtilsModule,
    BannersModule,
    HeadersModule,
    FootersModule,
    BodyModule,
    FormModule,
    TabsModule,
  ],
  declarations: [
    UnsupportedFieldComponent,

    // Read
    ReadTextFieldComponent,
    ReadTextAreaFieldComponent,
    ReadNumberFieldComponent,
    ReadEmailFieldComponent,
    ReadPhoneUKFieldComponent,
    ReadDateFieldComponent,
    ReadCollectionFieldComponent,

    // Write
    WriteCollectionFieldComponent,
    WriteTextFieldComponent,
    WriteTextAreaFieldComponent,
    WritePhoneUKFieldComponent,
    WriteNumberFieldComponent,
    WriteEmailFieldComponent,
    WriteDateFieldComponent,
  ],
  entryComponents: [
    UnsupportedFieldComponent,

    // Read
    ReadTextFieldComponent,
    ReadTextAreaFieldComponent,
    ReadNumberFieldComponent,
    ReadEmailFieldComponent,
    ReadPhoneUKFieldComponent,
    ReadDateFieldComponent,
    ReadCollectionFieldComponent,

    // Write
    WriteCollectionFieldComponent,
    WriteTextFieldComponent,
    WriteTextAreaFieldComponent,
    WritePhoneUKFieldComponent,
    WriteNumberFieldComponent,
    WriteEmailFieldComponent,
    WriteDateFieldComponent,
  ],
  exports: [
    BaseFieldModule,
    PaletteUtilsModule,
    UnsupportedFieldComponent,

    // Read
    ReadTextFieldComponent,
    ReadTextAreaFieldComponent,
    ReadNumberFieldComponent,
    ReadEmailFieldComponent,
    ReadPhoneUKFieldComponent,
    ReadDateFieldComponent,
    ReadCollectionFieldComponent,

    // Write
    WriteCollectionFieldComponent,
    WriteTextFieldComponent,
    WriteTextAreaFieldComponent,
    WritePhoneUKFieldComponent,
    WriteNumberFieldComponent,
    WriteEmailFieldComponent,
    WriteDateFieldComponent,
  ],
  providers: [
    PaletteService,
    FormValidatorsService,
  ]
})
export class PaletteModule { }
