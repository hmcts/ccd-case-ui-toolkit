import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule, MatFormFieldModule, MatInputModule, MAT_DATE_LOCALE } from '@angular/material';
import { PaymentLibModule } from '@hmcts/ccpay-web-component';
import { BannersModule } from '../../../components/banners/banners.module';
import { BodyModule } from '../../../components/body/body.module';
import { FootersModule } from '../../../components/footer/footers.module';
import { FormModule } from '../../../components/form/form.module';
import { HeadersModule } from '../../../components/header/headers.module';
import { TabsModule } from '../../../components/tabs/tabs.module';
import { LabelSubstitutorModule } from '../../directives/substitutor/label-substitutor.module';
import { PipesModule } from '../../pipes/pipes.module';
import { FormValidatorsService } from '../../services/form/form-validators.service';
import { MarkdownModule } from '../markdown/markdown.module';
import { AddressModule } from './address/address.module';
import { BaseFieldModule } from './base-field/base-field.module';
import { CaseLinkModule } from './case-link/case-link.module';
import { ReadCaseLinkFieldComponent } from './case-link/read-case-link-field.component';
import { WriteCaseLinkFieldComponent } from './case-link/write-case-link-field.component';
import { CollectionCreateCheckerService } from './collection/collection-create-checker.service';
import { ReadCollectionFieldComponent } from './collection/read-collection-field.component';
import { WriteCollectionFieldComponent } from './collection/write-collection-field.component';
import { ComplexModule } from './complex/complex.module';
import { ReadDateFieldComponent } from './date/read-date-field.component';
import { WriteDateContainerFieldComponent } from './date/write-date-container-field.component';
import { WriteDateFieldComponent } from './date/write-date-field.component';
import { DatetimePickerComponent } from './datetime-picker/datetime-picker.component';
import { DocumentModule } from './document/document.module';
import { FileUploadProgressGuard } from './document/file-upload-progress.guard';
import { FileUploadStateService } from './document/file-upload-state.service';
import { DynamicListModule } from './dynamic-list/dynamic-list.module';
import { DynamicMultiSelectListModule } from './dynamic-multi-select-list/dynamic-multi-select-list.module';
import { DynamicRadioListModule } from './dynamic-radio-list/dynamic-radio-list.module';
import { ReadEmailFieldComponent } from './email/read-email-field.component';
import { WriteEmailFieldComponent } from './email/write-email-field.component';
import { FixedListModule } from './fixed-list/fixed-list.module';
import { FixedRadioListModule } from './fixed-radio-list/fixed-radio-list.module';
import { CaseHistoryViewerModule } from './history/case-history-viewer.module';
import { LabelFieldComponent } from './label/label-field.component';
import { MoneyGbpModule } from './money-gbp/money-gbp.module';
import { MultiSelectListModule } from './multi-select-list/multi-select-list.module';
import { ReadNumberFieldComponent } from './number/read-number-field.component';
import { WriteNumberFieldComponent } from './number/write-number-field.component';
import { OrderSummaryModule } from './order-summary/order-summary.module';
import { OrganisationModule } from './organisation/organisation.module';
import { ReadOrganisationFieldComponent } from './organisation/read-organisation-field.component';
import { WriteOrganisationFieldComponent } from './organisation/write-organisation-field.component';
import { PaletteService } from './palette.service';
import { CasePaymentHistoryViewerModule } from './payment/case-payment-history-viewer.module';
import { ReadPhoneUKFieldComponent } from './phone-uk/read-phone-uk-field.component';
import { WritePhoneUKFieldComponent } from './phone-uk/write-phone-uk-field.component';
import { ReadTextAreaFieldComponent } from './text-area/read-text-area-field.component';
import { WriteTextAreaFieldComponent } from './text-area/write-text-area-field.component';
import { ReadTextFieldComponent } from './text/read-text-field.component';
import { WriteTextFieldComponent } from './text/write-text-field.component';
import { UnsupportedFieldComponent } from './unsupported-field.component';
import { PaletteUtilsModule } from './utils/utils.module';
import { WaysToPayFieldComponent } from './waystopay/waystopay-field.component';
import { YesNoModule } from './yes-no/yes-no.module';

@NgModule({
  imports: [
    CommonModule,
    BaseFieldModule,
    FixedListModule,
    DynamicListModule,
    DynamicMultiSelectListModule,
    DynamicRadioListModule,
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
    CaseHistoryViewerModule,
    PipesModule,
    BannersModule,
    HeadersModule,
    FootersModule,
    BodyModule,
    FormModule,
    TabsModule,
    LabelSubstitutorModule,
    CaseLinkModule,
    OrganisationModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    PaymentLibModule
  ],
  declarations: [
    UnsupportedFieldComponent,
    LabelFieldComponent,
    DatetimePickerComponent,
    WaysToPayFieldComponent,

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
    WriteDateContainerFieldComponent,
    WriteTextAreaFieldComponent,
    WritePhoneUKFieldComponent,
    WriteNumberFieldComponent,
    WriteEmailFieldComponent,
    WriteDateFieldComponent,
  ],
  entryComponents: [
    UnsupportedFieldComponent,
    LabelFieldComponent,
    WaysToPayFieldComponent,

    // Read
    ReadTextFieldComponent,
    ReadTextAreaFieldComponent,
    ReadNumberFieldComponent,
    ReadEmailFieldComponent,
    ReadPhoneUKFieldComponent,
    ReadDateFieldComponent,
    ReadCollectionFieldComponent,
    ReadCaseLinkFieldComponent,
    ReadOrganisationFieldComponent,

    // Write
    WriteCollectionFieldComponent,
    WriteTextFieldComponent,
    WriteTextAreaFieldComponent,
    WritePhoneUKFieldComponent,
    WriteNumberFieldComponent,
    WriteEmailFieldComponent,
    WriteDateFieldComponent,
    DatetimePickerComponent,
    WriteCaseLinkFieldComponent,
    WriteDateContainerFieldComponent,
    WriteOrganisationFieldComponent
  ],
  exports: [
    BaseFieldModule,
    LabelSubstitutorModule,
    PaletteUtilsModule,
    UnsupportedFieldComponent,
    LabelFieldComponent,
    DatetimePickerComponent,
    WaysToPayFieldComponent,

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
    WriteDateContainerFieldComponent,
  ],
  providers: [
    CollectionCreateCheckerService,
    PaletteService,
    FormValidatorsService,
    FileUploadStateService,
    FileUploadProgressGuard,
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'}
  ]
})
export class PaletteModule {
}
