import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { PaymentLibModule } from '@hmcts/ccpay-web-component';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { NgxMdModule } from 'ngx-md';
import { HeadersModule, TabsModule } from '../../../components';
import { BannersModule } from '../../../components/banners/banners.module';
import { BodyModule } from '../../../components/body/body.module';
import { FootersModule } from '../../../components/footer/footers.module';
import { FormModule } from '../../../components/form/form.module';
import { LabelSubstitutorModule } from '../../directives/substitutor';
import { PipesModule } from '../../pipes/pipes.module';
import { FormValidatorsService } from '../../services/form/form-validators.service';
import { WindowService } from '../../services/window';
import { WriteAddressFieldComponent } from './address/write-address-field.component';
import { FieldReadComponent, FieldReadLabelComponent, FieldWriteComponent } from './base-field';
import { CaseFileViewFieldComponent } from './case-file-view/case-file-view-field.component';
import { CaseFileViewFolderComponent } from './case-file-view/components/case-file-view-folder/case-file-view-folder.component';
import { ReadCaseLinkFieldComponent } from './case-link/read-case-link-field.component';
import { WriteCaseLinkFieldComponent } from './case-link/write-case-link-field.component';
import { ReadCollectionFieldComponent, WriteCollectionFieldComponent } from './collection';
import { CollectionCreateCheckerService } from './collection/collection-create-checker.service';
import { ReadComplexFieldCollectionTableComponent, ReadComplexFieldComponent, ReadComplexFieldRawComponent, ReadComplexFieldTableComponent, WriteComplexFieldComponent } from './complex';
import { ReadDateFieldComponent, WriteDateContainerFieldComponent, WriteDateFieldComponent } from './date';
import { DatetimePickerComponent } from './datetime-picker';
import { DocumentUrlPipe } from './document';
import { FileUploadProgressGuard } from './document/file-upload-progress.guard';
import { FileUploadStateService } from './document/file-upload-state.service';
import { ReadDocumentFieldComponent } from './document/read-document-field.component';
import { WriteDocumentFieldComponent } from './document/write-document-field.component';
import { DynamicListPipe, ReadDynamicListFieldComponent } from './dynamic-list';
import { WriteDynamicListFieldComponent } from './dynamic-list/write-dynamic-list-field.component';
import { DynamicRadioListPipe, ReadDynamicRadioListFieldComponent } from './dynamic-radio-list';
import { WriteDynamicRadioListFieldComponent } from './dynamic-radio-list/write-dynamic-radio-list-field.component';
import { ReadEmailFieldComponent, WriteEmailFieldComponent } from './email';
import { FixedListPipe, ReadFixedListFieldComponent, WriteFixedListFieldComponent } from './fixed-list';
import { FixedRadioListPipe, ReadFixedRadioListFieldComponent, WriteFixedRadioListFieldComponent } from './fixed-radio-list';
import { CaseHistoryViewerFieldComponent, EventLogComponent, EventLogDetailsComponent, EventLogTableComponent } from './history';
import { ReadJudicialUserFieldComponent, WriteJudicialUserFieldComponent } from './judicial-user';
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
import { PaletteUtilsModule } from './utils';
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
    ReadDocumentFieldComponent,

    // new
    ReadJudicialUserFieldComponent,
    ReadYesNoFieldComponent,
    ReadOrganisationFieldComponent,
    ReadOrganisationFieldTableComponent,
    ReadOrganisationFieldRawComponent,
    ReadOrderSummaryFieldComponent,
    ReadOrderSummaryRowComponent,
    ReadMoneyGbpFieldComponent,
    ReadMultiSelectListFieldComponent,
    ReadDynamicListFieldComponent,
    ReadFixedListFieldComponent,
    ReadFixedRadioListFieldComponent,
    ReadDynamicRadioListFieldComponent,
    ReadCaseLinkFieldComponent,
    ReadComplexFieldComponent,
    ReadComplexFieldRawComponent,
    ReadComplexFieldTableComponent,
    ReadComplexFieldCollectionTableComponent,

    // Write
    WriteJudicialUserFieldComponent,
    WriteAddressFieldComponent,
    WriteComplexFieldComponent,
    WriteOrganisationComplexFieldComponent,
    WriteDocumentFieldComponent,
    WriteDynamicListFieldComponent,
    WriteDynamicRadioListFieldComponent,
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
    WriteCollectionFieldComponent,

    // ComponentLauncher web components
    CaseFileViewFolderComponent,
    CaseFileViewFieldComponent
];

@NgModule({
  imports: [
    CommonModule,
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
    MatAutocompleteModule,
    CdkTreeModule,
    PaymentLibModule,
    ScrollToModule.forRoot()
  ],
  declarations: [
    FixedListPipe,
    FixedRadioListPipe,
    DynamicListPipe,
    DynamicRadioListPipe,
    DocumentUrlPipe,

    ...PALETTE_COMPONENTS
  ],
  exports: [
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
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
