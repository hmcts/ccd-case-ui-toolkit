import { NgModule } from '@angular/core';
import { PaginatePipe } from 'ngx-pagination';
import { HeadersModule } from './components/header/headers.module';
import { FootersModule } from './components/footer/footers.module';
import { BodyModule } from './components/body/body.module';

import { PhaseComponent } from './components/header/phase/phase.component';
import { HeaderBarComponent } from './components/header/header-bar/header-bar.component';
import { NavigationComponent } from './components/header/navigation/navigation.component';
import { NavigationItemComponent } from './components/header/navigation/navigation-item.component';
import { FooterComponent } from './components/footer/footer.component';
import { BodyComponent } from './components/body/body.component';
import { FormModule } from './components/form/form.module';
import { DateInputComponent } from './components/form/date-input/date-input.component';
import { TabsModule } from './components/tabs/tabs.module';
import { TabsComponent } from './components/tabs/tabs.component';
import { TabComponent } from './components/tabs/tab.component';
import { AlertComponent } from './components/banners/alert/alert.component';
import { BannersModule } from './components/banners/banners.module';
import { CaseEditorModule } from './shared/components/case-editor/case-editor.module';
import { CaseViewerModule } from './shared/components/case-viewer/case-viewer.module';
import { CaseEditComponent } from './shared/components/case-editor/case-edit/case-edit.component';
import { CallbackErrorsComponent } from './shared/components/error/callback-errors.component';
import { CaseCreateComponent } from './shared/components/case-editor/case-create/case-create.component';
import { CaseProgressComponent } from './shared/components/case-editor/case-progress/case-progress.component';
import { PaletteModule } from './shared/components/palette/palette.module';
import { DialogsModule } from './shared/components/dialogs/dialogs.module';
import { DocumentDialogComponent } from './shared/components/dialogs/document-dialog/document-dialog.component';
import { DeleteOrCancelDialogComponent } from './shared/components/dialogs/delete-or-cancel-dialog/delete-or-cancel-dialog.component';
import { SaveOrDiscardDialogComponent } from './shared/components/dialogs/save-or-discard-dialog/save-or-discard-dialog.component';
import { RemoveDialogComponent } from './shared/components/dialogs/remove-dialog/remove-dialog.component';
import { PipesModule, CaseReferencePipe, MarkdownComponent, MarkdownModule, BaseFieldModule, PaletteUtilsModule,
  UnsupportedFieldComponent, LabelFieldComponent, ReadTextFieldComponent, ReadTextAreaFieldComponent, ReadNumberFieldComponent,
  ReadEmailFieldComponent, ReadPhoneUKFieldComponent, ReadDateFieldComponent, ReadCollectionFieldComponent, WriteCollectionFieldComponent,
  WriteTextFieldComponent, WriteTextAreaFieldComponent, WritePhoneUKFieldComponent, WriteNumberFieldComponent, WriteEmailFieldComponent,
  WriteDateFieldComponent, ConditionalShowModule, ConditionalShowDirective, LabelSubstitutorModule,
  LabelSubstitutorDirective, CaseViewerComponent, CaseViewComponent, SearchFiltersModule, FocusElementModule,
  FocusElementDirective, LoadingModule, PaginationModule, PaginationComponent } from './shared';
import { CaseHistoryModule } from './shared/components/case-history';

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
      PaginationModule
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

      ConditionalShowDirective,
      LabelSubstitutorDirective,
      FocusElementDirective,
      PaginatePipe
    ]
})
export class CaseUIToolkitModule {}
