import { NgModule } from '@angular/core';
import { HeadersModule } from './headers.module';
import { FootersModule } from './footers.module';
import { BodyModule } from './body.module';

import { PhaseComponent } from './components/phase/phase.component';
import { HeaderComponent } from './components/header/header.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { NavigationItemComponent } from './components/navigation/navigation-item.component';
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
  LabelSubstitutorDirective, CaseViewerComponent, CaseViewComponent, PrintUrlPipe} from './shared';

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
      PaletteModule,
      DialogsModule,
      PipesModule,
      MarkdownModule,
      PaletteModule,
      ConditionalShowModule,
      LabelSubstitutorModule,
    ],
    exports: [
      AlertComponent,
      PhaseComponent,
      HeaderComponent,
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
      PrintUrlPipe,
      CallbackErrorsComponent,
      PaletteModule,
      DocumentDialogComponent,
      DeleteOrCancelDialogComponent,
      SaveOrDiscardDialogComponent,
      RemoveDialogComponent,
      CaseReferencePipe,
      MarkdownComponent,

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
    ]
})
export class CaseUIToolkitModule {}
