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
import { ReadMoneyGbpFieldComponent } from 'src/shared';

import { HeadersModule, TabsModule } from '../../../components';
import { BannersModule } from '../../../components/banners/banners.module';
import { BodyModule } from '../../../components/body/body.module';
import { FootersModule } from '../../../components/footer/footers.module';
import { FormModule } from '../../../components/form/form.module';

import { PaletteUtilsModule } from './utils';

import { LabelSubstitutorModule } from '../../directives';
import { PipesModule } from '../../pipes/pipes.module';
import { FormValidatorsService } from '../../services';
import { FieldReadComponent, FieldReadLabelComponent } from './base-field';

import { ReadCollectionFieldComponent, WriteCollectionFieldComponent } from './collection';
import { CollectionCreateCheckerService } from './collection/collection-create-checker.service';
import { ReadDateFieldComponent, WriteDateContainerFieldComponent, WriteDateFieldComponent } from './date';
import { DatetimePickerComponent } from './datetime-picker';
import { FileUploadProgressGuard } from './document/file-upload-progress.guard';
import { FileUploadStateService } from './document/file-upload-state.service';
import { ReadEmailFieldComponent, WriteEmailFieldComponent } from './email';
import { LabelFieldComponent } from './label';
import { MarkdownComponent } from './markdown';
import { WriteMoneyGbpFieldComponent } from './money-gbp';
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
import { ReadYesNoFieldComponent, WriteYesNoFieldComponent } from './yes-no';

@NgModule({
  imports: [
    CommonModule,
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
    UnsupportedFieldComponent,
    LabelFieldComponent,
    DatetimePickerComponent,
    WaysToPayFieldComponent,
    MarkdownComponent,
    FieldReadComponent,
    FieldReadLabelComponent,
    CasePaymentHistoryViewerFieldComponent,

    // // Read
    ReadTextFieldComponent,
    ReadTextAreaFieldComponent,
    ReadNumberFieldComponent,
    ReadEmailFieldComponent,
    ReadPhoneUKFieldComponent,
    ReadDateFieldComponent,
    ReadCollectionFieldComponent,

    ReadYesNoFieldComponent,
    ReadOrganisationFieldComponent,
    ReadOrganisationFieldTableComponent,
    ReadOrganisationFieldRawComponent,
    ReadOrderSummaryFieldComponent,
    ReadOrderSummaryRowComponent,
    ReadMoneyGbpFieldComponent,

    // Write
    WriteCollectionFieldComponent,
    WriteTextFieldComponent,
    WriteDateContainerFieldComponent,
    WriteTextAreaFieldComponent,
    WritePhoneUKFieldComponent,
    WriteNumberFieldComponent,
    WriteEmailFieldComponent,
    WriteDateFieldComponent,

    WriteYesNoFieldComponent,
    WriteOrganisationFieldComponent,
    WriteOrganisationComplexFieldComponent,
    WriteOrderSummaryFieldComponent,
    WriteMoneyGbpFieldComponent,
    WriteDateContainerFieldComponent
  ],
  exports: [
    LabelSubstitutorModule,
    TabsModule,
    PaletteUtilsModule,
    PipesModule,
    UnsupportedFieldComponent,
    LabelFieldComponent,
    DatetimePickerComponent,
    WaysToPayFieldComponent,

    // // Read
    ReadTextFieldComponent,
    ReadTextAreaFieldComponent,
    ReadNumberFieldComponent,
    ReadEmailFieldComponent,
    ReadPhoneUKFieldComponent,
    ReadDateFieldComponent,
    ReadCollectionFieldComponent,

    // // Write
    WriteCollectionFieldComponent,
    WriteTextFieldComponent,
    WriteTextAreaFieldComponent,
    WritePhoneUKFieldComponent,
    WriteNumberFieldComponent,
    WriteEmailFieldComponent,
    WriteDateFieldComponent,
    WriteDateContainerFieldComponent
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
