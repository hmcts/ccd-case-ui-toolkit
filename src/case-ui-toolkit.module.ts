import { NgModule } from '@angular/core';
import { PaginatePipe } from 'ngx-pagination';

import { AlertComponent, BannersModule } from './components/banners';
import { BodyComponent, BodyModule } from './components/body';
import { FooterComponent, FootersModule } from './components/footer';
import { DateInputComponent, FormModule } from './components/form';
import { HeaderBarComponent, HeadersModule, PhaseComponent } from './components/header';
import { NavigationComponent, NavigationItemComponent } from './components/header/navigation';
import { TabComponent, TabsComponent, TabsModule } from './components/tabs';
import { LoadingModule, MarkdownComponent, MarkdownModule, SearchFiltersModule } from './shared';
import { CaseEditComponent, CaseEditorModule } from './shared/components/case-editor';
import { CaseCreateComponent } from './shared/components/case-editor/case-create';
import { CaseProgressComponent } from './shared/components/case-editor/case-progress';
import { CaseHistoryModule } from './shared/components/case-history';
import { CaseViewComponent, CaseViewerComponent, CaseViewerModule } from './shared/components/case-viewer';
import {
  DeleteOrCancelDialogComponent,
  DialogsModule,
  DocumentDialogComponent,
  RemoveDialogComponent,
  SaveOrDiscardDialogComponent,
} from './shared/components/dialogs';
import { CallbackErrorsComponent } from './shared/components/error/callback-errors.component';
import { PaginationComponent, PaginationModule } from './shared/components/pagination';
import {
  BaseFieldModule,
  LabelFieldComponent,
  PaletteModule,
  PaletteUtilsModule,
  UnsupportedFieldComponent,
} from './shared/components/palette';
import { ReadCollectionFieldComponent, WriteCollectionFieldComponent } from './shared/components/palette/collection';
import { ReadDateFieldComponent, WriteDateFieldComponent } from './shared/components/palette/date';
import { ReadEmailFieldComponent, WriteEmailFieldComponent } from './shared/components/palette/email';
import { ReadNumberFieldComponent, WriteNumberFieldComponent } from './shared/components/palette/number';
import { ReadPhoneUKFieldComponent, WritePhoneUKFieldComponent } from './shared/components/palette/phone-uk';
import { ReadTextFieldComponent, WriteTextFieldComponent } from './shared/components/palette/text';
import { ReadTextAreaFieldComponent, WriteTextAreaFieldComponent } from './shared/components/palette/text-area';
import { ConditionalShowDirective, ConditionalShowModule } from './shared/directives/conditional-show';
import { FocusElementDirective, FocusElementModule } from './shared/directives/focus-element';
import { LabelSubstitutorDirective, LabelSubstitutorModule } from './shared/directives/substitutor';
import { CaseReferencePipe, PipesModule } from './shared/pipes';

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
