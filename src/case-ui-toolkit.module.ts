import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { PaginatePipe } from 'ngx-pagination';
import { AlertComponent } from './components/banners/alert/alert.component';
import { BannersModule } from './components/banners/banners.module';
import { BodyComponent } from './components/body/body.component';
import { BodyModule } from './components/body/body.module';
import { FooterComponent } from './components/footer/footer.component';
import { FootersModule } from './components/footer/footers.module';
import { DateInputComponent } from './components/form/date-input/date-input.component';
import { FormModule } from './components/form/form.module';
import { HeaderBarComponent } from './components/header/header-bar/header-bar.component';
import { HeadersModule } from './components/header/headers.module';
import { NavigationItemComponent } from './components/header/navigation/navigation-item.component';
import { NavigationComponent } from './components/header/navigation/navigation.component';
import { PhaseComponent } from './components/header/phase/phase.component';
import { TabComponent } from './components/tabs/tab.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TabsModule } from './components/tabs/tabs.module';
import {
  BaseFieldModule,
  CaseReferencePipe,
  CaseViewComponent,
  CaseViewerComponent,
  ConditionalShowModule,
  FocusElementDirective,
  FocusElementModule,
  LabelFieldComponent,
  LabelSubstitutorDirective,
  LabelSubstitutorModule,
  LoadingModule,
  MarkdownComponent,
  MarkdownModule,
  PaginationComponent,
  PaginationModule,
  PaletteUtilsModule,
  PipesModule,
  ReadCollectionFieldComponent,
  ReadDateFieldComponent,
  ReadEmailFieldComponent,
  ReadNumberFieldComponent,
  ReadPhoneUKFieldComponent,
  ReadTextAreaFieldComponent,
  ReadTextFieldComponent,
  SearchFiltersModule,
  UnsupportedFieldComponent,
  WriteCollectionFieldComponent,
  WriteDateFieldComponent,
  WriteEmailFieldComponent,
  WriteNumberFieldComponent,
  WritePhoneUKFieldComponent,
  WriteTextAreaFieldComponent,
  WriteTextFieldComponent
} from './shared';
import { CaseCreateComponent } from './shared/components/case-editor/case-create/case-create.component';
import { CaseEditComponent } from './shared/components/case-editor/case-edit/case-edit.component';
import { CaseEditorModule } from './shared/components/case-editor/case-editor.module';
import { CaseProgressComponent } from './shared/components/case-editor/case-progress/case-progress.component';
import { CaseHistoryModule } from './shared/components/case-history';
import { CaseViewerModule } from './shared/components/case-viewer/case-viewer.module';
import { DeleteOrCancelDialogComponent } from './shared/components/dialogs/delete-or-cancel-dialog/delete-or-cancel-dialog.component';
import { DialogsModule } from './shared/components/dialogs/dialogs.module';
import { DocumentDialogComponent } from './shared/components/dialogs/document-dialog/document-dialog.component';
import { RemoveDialogComponent } from './shared/components/dialogs/remove-dialog/remove-dialog.component';
import { SaveOrDiscardDialogComponent } from './shared/components/dialogs/save-or-discard-dialog/save-or-discard-dialog.component';
import { CallbackErrorsComponent } from './shared/components/error/callback-errors.component';
import { PaletteModule } from './shared/components/palette/palette.module';

@NgModule({
    imports: [
      BannersModule,
      HeadersModule,
      FootersModule,
      BodyModule,
      FormModule,
      TabsModule,
      CaseEditorModule,
      CaseViewerModule,
      CaseHistoryModule,
      PaletteModule,
      DialogsModule,
      PipesModule,
      MarkdownModule,
      ConditionalShowModule,
      LabelSubstitutorModule,
      SearchFiltersModule,
      FocusElementModule,
      LoadingModule,
      PaginationModule,
      PortalModule
    ],
    exports: [
      AlertComponent,
      PhaseComponent,
      HeaderBarComponent,
      NavigationComponent,
      NavigationItemComponent,
      FooterComponent,
      BodyComponent,
      DateInputComponent,
      TabsComponent,
      TabComponent,
      CaseEditComponent,
      CaseCreateComponent,
      CaseProgressComponent,
      CaseViewComponent,
      CaseViewerComponent,
      CallbackErrorsComponent,
      DocumentDialogComponent,
      DeleteOrCancelDialogComponent,
      SaveOrDiscardDialogComponent,
      RemoveDialogComponent,
      CaseReferencePipe,
      MarkdownComponent,
      PaginationComponent,

    BaseFieldModule,
    PaletteUtilsModule,
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

    // Write
    WriteCollectionFieldComponent,
    WriteTextFieldComponent,
    WriteTextAreaFieldComponent,
    WritePhoneUKFieldComponent,
    WriteNumberFieldComponent,
    WriteEmailFieldComponent,
    WriteDateFieldComponent,
    LabelSubstitutorDirective,
    FocusElementDirective,
    PaginatePipe,
  ]
})
export class CaseUIToolkitModule {}
