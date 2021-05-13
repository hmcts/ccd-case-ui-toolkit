import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DATE_LOCALE, MatDatepickerModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule, } from '@angular-material-components/datetime-picker';
import { ReadTextFieldComponent } from './text/read-text-field.component';
import { PaletteService } from './palette.service';
import { ReadNumberFieldComponent } from './number/read-number-field.component';
import { ReadEmailFieldComponent } from './email/read-email-field.component';
import { ReadPhoneUKFieldComponent } from './phone-uk/read-phone-uk-field.component';
import { ReadDateFieldComponent } from './date/read-date-field.component';
import { WriteDateContainerFieldComponent } from './date';
import { FixedListModule } from './fixed-list/fixed-list.module';
import { DynamicListModule } from './dynamic-list/dynamic-list.module';
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
import { DatetimePickerComponent } from './datetime-picker/datetime-picker.component';
import { DocumentModule } from './document/document.module';
import { MarkdownModule } from '../markdown/markdown.module';
import { FormValidatorsService } from '../../services/form/form-validators.service';
import { OrderSummaryModule } from './order-summary/order-summary.module';
import { CasePaymentHistoryViewerModule } from './payment/case-payment-history-viewer.module';
import { PipesModule } from '../../pipes/pipes.module';
import { BannersModule } from '../../../components/banners/banners.module';
import { HeadersModule } from '../../../components/header/headers.module';
import { FootersModule } from '../../../components/footer/footers.module';
import { BodyModule } from '../../../components/body/body.module';
import { FormModule } from '../../../components/form/form.module';
import { TabsModule } from '../../../components/tabs/tabs.module';
import { LabelFieldComponent } from './label';
import { LabelSubstitutorModule } from '../../directives/substitutor';
import { ReadCaseLinkFieldComponent } from './case-link/read-case-link-field.component';
import { WriteCaseLinkFieldComponent } from './case-link/write-case-link-field.component';
import { FixedRadioListModule } from './fixed-radio-list';
import { CaseHistoryViewerModule } from './history';
import { CollectionCreateCheckerService } from './collection/collection-create-checker.service';
import { CaseLinkModule } from './case-link/case-link.module';
import { FileUploadProgressGuard } from './document/file-upload-progress.guard';
import { FileUploadStateService } from './document/file-upload-state.service';
import { OrganisationModule } from './organisation/organisation.module';
import { ReadOrganisationFieldComponent, WriteOrganisationFieldComponent } from './organisation';

@NgModule({
  imports: [
    CommonModule,
    BaseFieldModule,
    FixedListModule,
    DynamicListModule,
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
    MatDatepickerModule
  ],
  declarations: [
    UnsupportedFieldComponent,
    LabelFieldComponent,
    DatetimePickerComponent,

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
    PaletteUtilsModule,
    UnsupportedFieldComponent,
    LabelFieldComponent,
    DatetimePickerComponent,

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
