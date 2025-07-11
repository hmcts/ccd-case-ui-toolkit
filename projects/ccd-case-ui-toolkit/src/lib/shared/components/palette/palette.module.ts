import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, NgModule, Provider, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MAT_LEGACY_DATE_LOCALE as MAT_DATE_LOCALE } from '@angular/material/legacy-core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { RouterModule } from '@angular/router';
import { PaymentLibModule } from '@hmcts/ccpay-web-component';
import { MediaViewerModule } from '@hmcts/media-viewer';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { MarkdownModule } from 'ngx-markdown';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { HeadersModule, TabsModule } from '../../../components';
import { BannersModule } from '../../../components/banners/banners.module';
import { BodyModule } from '../../../components/body/body.module';
import { FootersModule } from '../../../components/footer/footers.module';
import { FormModule } from '../../../components/form/form.module';
import { CaseEditDataModule } from '../../commons/case-edit-data';
import { LabelSubstitutorModule } from '../../directives/substitutor';
import { PipesModule } from '../../pipes/pipes.module';
import { CaseFlagRefdataService } from '../../services/case-flag/case-flag-refdata.service';
import { CommonDataService } from '../../services/common-data-service/common-data-service';
import { FormValidatorsService } from '../../services/form/form-validators.service';
import { JurisdictionService } from '../../services/jurisdiction/jurisdiction.service';
import { LoadingModule } from '../../services/loading/loading.module';
import { WindowService } from '../../services/window';
import { CaseEventCompletionComponent, CaseEventCompletionTaskCancelledComponent, CaseEventCompletionTaskReassignedComponent } from '../case-editor/case-event-completion';
import { WriteAddressFieldComponent } from './address/write-address-field.component';
import { FieldReadComponent, FieldReadLabelComponent, FieldWriteComponent } from './base-field';
import { CaseFileViewOverlayMenuComponent } from './case-file-view';
import { CaseFileViewFieldComponent } from './case-file-view/case-file-view-field.component';
import {
  CaseFileViewFolderSelectorComponent
} from './case-file-view/components/case-file-view-folder-selector/case-file-view-folder-selector.component';
import {
  CaseFileViewFolderDocumentActionsComponent
} from './case-file-view/components/case-file-view-folder/case-file-view-folder-document-actions/case-file-view-folder-document-actions.component';
import {
  CaseFileViewFolderSortComponent
} from './case-file-view/components/case-file-view-folder/case-file-view-folder-sort/case-file-view-folder-sort.component';
import { CaseFileViewFolderToggleComponent } from './case-file-view/components/case-file-view-folder/case-file-view-folder-toggle/case-file-view-folder-toggle.component';
import { CaseFileViewFolderComponent } from './case-file-view/components/case-file-view-folder/case-file-view-folder.component';
import {
  AddCommentsComponent,
  CaseFlagSummaryListComponent,
  CaseFlagTableComponent,
  ConfirmFlagStatusComponent,
  FlagFieldDisplayPipe,
  LanguageInterpreterDisplayPipe,
  ManageCaseFlagsComponent,
  ManageCaseFlagsLabelDisplayPipe,
  ReadCaseFlagFieldComponent,
  SearchLanguageInterpreterComponent,
  SelectFlagLocationComponent,
  SelectFlagTypeComponent,
  UpdateFlagAddTranslationFormComponent,
  UpdateFlagComponent,
  UpdateFlagTitleDisplayPipe,
  WriteCaseFlagFieldComponent
} from './case-flag';
import { ReadCaseLinkFieldComponent } from './case-link/read-case-link-field.component';
import { WriteCaseLinkFieldComponent } from './case-link/write-case-link-field.component';
import { ReadCollectionFieldComponent, WriteCollectionFieldComponent } from './collection';
import { CollectionCreateCheckerService } from './collection/collection-create-checker.service';
import {
  ReadComplexFieldCollectionTableComponent,
  ReadComplexFieldComponent,
  ReadComplexFieldRawComponent,
  ReadComplexFieldTableComponent,
  WriteComplexFieldComponent
} from './complex';
import { ReadDateFieldComponent, WriteDateContainerFieldComponent, WriteDateFieldComponent } from './date';
import { DatetimePickerComponent } from './datetime-picker';
import { DocumentUrlPipe } from './document';
import { FileUploadProgressGuard } from './document/file-upload-progress.guard';
import { FileUploadStateService } from './document/file-upload-state.service';
import { ReadDocumentFieldComponent } from './document/read-document-field.component';
import { WriteDocumentFieldComponent } from './document/write-document-field.component';
import { DynamicListPipe, ReadDynamicListFieldComponent } from './dynamic-list';
import { WriteDynamicListFieldComponent } from './dynamic-list/write-dynamic-list-field.component';
import { ReadDynamicMultiSelectListFieldComponent, WriteDynamicMultiSelectListFieldComponent } from './dynamic-multi-select-list';
import { DynamicRadioListPipe, ReadDynamicRadioListFieldComponent } from './dynamic-radio-list';
import { WriteDynamicRadioListFieldComponent } from './dynamic-radio-list/write-dynamic-radio-list-field.component';
import { ReadEmailFieldComponent, WriteEmailFieldComponent } from './email';
import { FixedListPipe, ReadFixedListFieldComponent, WriteFixedListFieldComponent } from './fixed-list';
import { FixedRadioListPipe, ReadFixedRadioListFieldComponent, WriteFixedRadioListFieldComponent } from './fixed-radio-list';
import { CaseHistoryViewerFieldComponent, EventLogComponent, EventLogDetailsComponent, EventLogTableComponent } from './history';
import { ReadJudicialUserFieldComponent, WriteJudicialUserFieldComponent } from './judicial-user';
import { LabelFieldComponent } from './label';
import {
  BeforeYouStartComponent,
  CheckYourAnswersComponent,
  LinkCasesComponent,
  LinkedCasesFromTableComponent,
  LinkedCasesToTableComponent,
  NoLinkedCasesComponent,
  ReadLinkedCasesFieldComponent,
  UnLinkCasesComponent,
  WriteLinkedCasesFieldComponent
} from './linked-cases';
import { LinkedCasesService } from './linked-cases/services';
import { MarkdownComponentModule } from './markdown';
import { MoneyGbpInputComponent, ReadMoneyGbpFieldComponent, WriteMoneyGbpFieldComponent } from './money-gbp';
import { ReadMultiSelectListFieldComponent, WriteMultiSelectListFieldComponent } from './multi-select-list';
import { ReadNumberFieldComponent, WriteNumberFieldComponent } from './number';
import { ReadOrderSummaryFieldComponent, ReadOrderSummaryRowComponent, WriteOrderSummaryFieldComponent } from './order-summary';
import {
  ReadOrganisationFieldComponent,
  ReadOrganisationFieldRawComponent,
  ReadOrganisationFieldTableComponent,
  WriteOrganisationComplexFieldComponent,
  WriteOrganisationFieldComponent
} from './organisation';
import { PaletteService } from './palette.service';
import { CasePaymentHistoryViewerFieldComponent } from './payment';
import { ReadPhoneUKFieldComponent, WritePhoneUKFieldComponent } from './phone-uk';
import {
  QualifyingQuestionDetailComponent,
  QualifyingQuestionOptionsComponent,
  QueryAttachmentsReadComponent,
  QueryCaseDetailsHeaderComponent,
  QueryCheckYourAnswersComponent,
  QueryDetailsComponent,
  QueryEventCompletionComponent,
  QueryListComponent,
  QueryWriteAddDocumentsComponent,
  QueryWriteDateInputComponent,
  QueryWriteRaiseQueryComponent,
  QueryWriteRespondToQueryComponent,
  ReadQueryManagementFieldComponent,
  CloseQueryComponent

} from './query-management';
import { QualifyingQuestionService } from './query-management/services';
import { ReadTextFieldComponent, WriteTextFieldComponent } from './text';
import { ReadTextAreaFieldComponent, WriteTextAreaFieldComponent } from './text-area';
import { UnsupportedFieldComponent } from './unsupported-field.component';
import { PaletteUtilsModule } from './utils';
import { WaysToPayFieldComponent } from './waystopay';
import { ReadYesNoFieldComponent, WriteYesNoFieldComponent, YesNoService } from './yes-no';
import { QueryConfirmationComponent } from './query-management/components/query-confirmation/query-confirmation.component';
import { ErrorsModule } from '../error/errors.module';

const PALETTE_COMPONENTS = [
  UnsupportedFieldComponent,
  DatetimePickerComponent,
  WaysToPayFieldComponent,
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

  // Read
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
  ReadCaseFlagFieldComponent,
  ReadLinkedCasesFieldComponent,

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
  WriteCaseFlagFieldComponent,
  WriteLinkedCasesFieldComponent,

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
  CaseFileViewFieldComponent,
  CaseFileViewFolderComponent,
  CaseFileViewFolderSortComponent,
  CaseFileViewFolderToggleComponent,
  CaseFileViewOverlayMenuComponent,
  CaseFileViewFolderDocumentActionsComponent,
  CaseFileViewFolderSelectorComponent,
  // component for dynamic list
  WriteDynamicMultiSelectListFieldComponent,
  WriteDynamicRadioListFieldComponent,
  WriteDynamicListFieldComponent,
  ReadDynamicMultiSelectListFieldComponent,
  ReadDynamicListFieldComponent,
  ReadDynamicRadioListFieldComponent,
  // Components for case flags
  CaseFlagTableComponent,
  SelectFlagTypeComponent,
  SearchLanguageInterpreterComponent,
  SelectFlagLocationComponent,
  ManageCaseFlagsComponent,
  AddCommentsComponent,
  UpdateFlagComponent,
  CaseFlagSummaryListComponent,
  ConfirmFlagStatusComponent,
  UpdateFlagAddTranslationFormComponent,
  // Components for linked cases
  LinkedCasesToTableComponent,
  LinkedCasesFromTableComponent,
  BeforeYouStartComponent,
  LinkCasesComponent,
  CheckYourAnswersComponent,
  UnLinkCasesComponent,
  NoLinkedCasesComponent,

  // Components for Query Management
  ReadQueryManagementFieldComponent,
  QueryDetailsComponent,
  QueryListComponent,
  QueryWriteRespondToQueryComponent,
  QueryWriteRaiseQueryComponent,
  QueryCaseDetailsHeaderComponent,
  QueryCheckYourAnswersComponent,
  QueryWriteAddDocumentsComponent,
  QueryWriteDateInputComponent,
  QualifyingQuestionOptionsComponent,
  QualifyingQuestionDetailComponent,
  QueryAttachmentsReadComponent,
  QueryEventCompletionComponent,
  QueryConfirmationComponent,
  CloseQueryComponent,

  // Case event completion
  CaseEventCompletionComponent,
  CaseEventCompletionTaskCancelledComponent,
  CaseEventCompletionTaskReassignedComponent
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CaseEditDataModule,
    PaletteUtilsModule,
    PipesModule,
    BannersModule,
    HeadersModule,
    FootersModule,
    BodyModule,
    FormModule,
    TabsModule,
    LabelSubstitutorModule,
    MarkdownModule.forChild(),
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    CdkTreeModule,
    OverlayModule,
    PaymentLibModule,
    ScrollToModule.forRoot(),
    RpxTranslationModule.forChild(),
    CdkTreeModule,
    OverlayModule,
    MatDialogModule,
    MediaViewerModule,
    LoadingModule,
    MarkdownComponentModule,
    ErrorsModule
  ],
  declarations: [
    FixedListPipe,
    FixedRadioListPipe,
    DynamicListPipe,
    DynamicRadioListPipe,
    DocumentUrlPipe,
    FlagFieldDisplayPipe,
    LanguageInterpreterDisplayPipe,
    ManageCaseFlagsLabelDisplayPipe,
    UpdateFlagTitleDisplayPipe,
    ...PALETTE_COMPONENTS
  ],
  exports: [
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    TabsModule,
    PaletteUtilsModule,
    PipesModule,
    MarkdownComponentModule,
    ...PALETTE_COMPONENTS
  ],
  providers: [
    ChangeDetectorRef as Provider,
    CaseFlagRefdataService,
    YesNoService,
    CollectionCreateCheckerService,
    JurisdictionService,
    PaletteService,
    FormValidatorsService,
    FileUploadStateService,
    FileUploadProgressGuard,
    WindowService,
    CommonDataService,
    LinkedCasesService,
    QualifyingQuestionService,
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'}
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PaletteModule {
}
