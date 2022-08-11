import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PaymentLibModule } from '@hmcts/ccpay-web-component';
import { NgxMdModule } from 'ngx-md';

import { HeadersModule, TabsModule } from '../../../components';
import { BannersModule } from '../../../components/banners/banners.module';
import { BodyModule } from '../../../components/body/body.module';
import { FootersModule } from '../../../components/footer/footers.module';
import { FormModule } from '../../../components/form/form.module';

import { PaletteUtilsModule } from './utils';

import { PipesModule } from '../../pipes/pipes.module';
import { FieldReadComponent, FieldReadLabelComponent, FieldWriteComponent } from './base-field';

import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { LabelSubstitutorModule } from '../../directives/substitutor';
import { FormValidatorsService } from '../../services/form/form-validators.service';
import { WindowService } from '../../services/window';
import { ReadCaseLinkFieldComponent } from './case-link/read-case-link-field.component';
import { WriteCaseLinkFieldComponent } from './case-link/write-case-link-field.component';
import { ReadCollectionFieldComponent, WriteCollectionFieldComponent } from './collection';
import { CollectionCreateCheckerService } from './collection/collection-create-checker.service';
import { CcdCollectionTableCaseFieldsFilterPipe, CcdCYAPageLabelFilterPipe, CcdPageFieldsPipe, CcdTabFieldsPipe, FieldsFilterPipe, ReadComplexFieldCollectionTableComponent, ReadComplexFieldComponent, ReadComplexFieldRawComponent, ReadComplexFieldTableComponent, ReadFieldsFilterPipe, WriteComplexFieldComponent } from './complex';
import { ReadDateFieldComponent, WriteDateContainerFieldComponent, WriteDateFieldComponent } from './date';
import { DatetimePickerComponent } from './datetime-picker';
import { DocumentUrlPipe } from './document';
import { FileUploadProgressGuard } from './document/file-upload-progress.guard';
import { FileUploadStateService } from './document/file-upload-state.service';
import { DynamicListPipe } from './dynamic-list';
import { DynamicRadioListPipe } from './dynamic-radio-list';
import { ReadEmailFieldComponent, WriteEmailFieldComponent } from './email';
import { FixedListPipe, ReadFixedListFieldComponent, WriteFixedListFieldComponent } from './fixed-list';
import { FixedRadioListPipe, ReadFixedRadioListFieldComponent, WriteFixedRadioListFieldComponent } from './fixed-radio-list';
import { CaseHistoryViewerFieldComponent, EventLogComponent, EventLogDetailsComponent, EventLogTableComponent } from './history';
import { LabelFieldComponent } from './label';
import { MarkdownComponent } from './markdown';
import { MoneyGbpInputComponent, ReadMoneyGbpFieldComponent, WriteMoneyGbpFieldComponent } from './money-gbp';
import { ReadMultiSelectListFieldComponent, WriteMultiSelectListFieldComponent } from './multi-select-list';
import { ReadNumberFieldComponent, WriteNumberFieldComponent } from './number';
import { ReadOrderSummaryFieldComponent, ReadOrderSummaryRowComponent, WriteOrderSummaryFieldComponent } from './order-summary';
import { ReadOrganisationFieldComponent, ReadOrganisationFieldRawComponent, ReadOrganisationFieldTableComponent, WriteOrganisationComplexFieldComponent, WriteOrganisationFieldComponent } from './organisation';
import { PaletteService } from './palette.service';
import { CasePaymentHistoryViewerFieldComponent } from './payment';
import { ReadPhoneUKFieldComponent, WritePhoneUKFieldComponent } from './phone-uk';
import { ReadTextFieldComponent, WriteTextFieldComponent } from './text';
import { ReadTextAreaFieldComponent, WriteTextAreaFieldComponent } from './text-area';
import { UnsupportedFieldComponent } from './unsupported-field.component';
import { WaysToPayFieldComponent } from './waystopay';
import { ReadYesNoFieldComponent, WriteYesNoFieldComponent, YesNoService } from './yes-no';

const PALETTE_COMPONENTS = [
    UnsupportedFieldComponent,
    DatetimePickerComponent,
    WaysToPayFieldComponent,
    MarkdownComponent,
    FieldReadComponent,
    FieldWriteComponent,
    FieldReadLabelComponent,
    LabelFieldComponent,
    CasePaymentHistoryViewerFieldComponent,
    MoneyGbpInputComponent,
    CaseHistoryViewerFieldComponent,
    EventLogComponent,
    EventLogDetailsComponent,
    EventLogTableComponent,

    // // Read
    ReadTextFieldComponent,
    ReadTextAreaFieldComponent,
    ReadNumberFieldComponent,
    ReadEmailFieldComponent,
    ReadPhoneUKFieldComponent,
    ReadDateFieldComponent,
    ReadCollectionFieldComponent,

    // new
    ReadYesNoFieldComponent,
    ReadOrganisationFieldComponent,
    ReadOrganisationFieldTableComponent,
    ReadOrganisationFieldRawComponent,
    ReadOrderSummaryFieldComponent,
    ReadOrderSummaryRowComponent,
    ReadMoneyGbpFieldComponent,
    ReadMultiSelectListFieldComponent,
    ReadFixedListFieldComponent,
    ReadFixedRadioListFieldComponent,
    ReadCaseLinkFieldComponent,
    ReadComplexFieldComponent,
    ReadComplexFieldRawComponent,
    ReadComplexFieldTableComponent,
    ReadComplexFieldCollectionTableComponent,

    // Write
    WriteComplexFieldComponent,
    WriteTextFieldComponent,
    WriteDateContainerFieldComponent,
    WriteTextAreaFieldComponent,
    WritePhoneUKFieldComponent,
    WriteNumberFieldComponent,
    WriteEmailFieldComponent,
    WriteDateFieldComponent,

    // new
    WriteYesNoFieldComponent,
    WriteOrganisationFieldComponent,
    WriteOrganisationComplexFieldComponent,
    WriteOrderSummaryFieldComponent,
    WriteMoneyGbpFieldComponent,
    WriteDateContainerFieldComponent,
    WriteMultiSelectListFieldComponent,
    WriteFixedListFieldComponent,
    WriteFixedRadioListFieldComponent,
    WriteCaseLinkFieldComponent,
    WriteCollectionFieldComponent
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PaletteUtilsModule,
    PipesModule,
    BannersModule,
    HeadersModule,
    FootersModule,
    BodyModule,
    FormModule,
    TabsModule,
    LabelSubstitutorModule,
    NgxMdModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    PaymentLibModule,
  ],
  declarations: [
    CcdCollectionTableCaseFieldsFilterPipe,
    CcdCYAPageLabelFilterPipe,
    CcdTabFieldsPipe,
    ReadFieldsFilterPipe,
    FieldsFilterPipe,
    CcdPageFieldsPipe,
    FixedListPipe,
    FixedRadioListPipe,
    DynamicListPipe,
    DynamicRadioListPipe,
    DocumentUrlPipe,

    ...PALETTE_COMPONENTS
  ],
  exports: [
    TabsModule,
    PaletteUtilsModule,
    PipesModule,

    ...PALETTE_COMPONENTS
  ],
  providers: [
    YesNoService,
    CollectionCreateCheckerService,
    PaletteService,
    FormValidatorsService,
    FileUploadStateService,
    FileUploadProgressGuard,
    WindowService,
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'}
  ]
})
export class PaletteModule {
}
