import { ChangeDetectorRef, NgModule, Provider } from '@angular/core';
import { ReadCaseLinkFieldComponent } from './read-case-link-field.component';
import { WriteCaseLinkFieldComponent } from './write-case-link-field.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../../pipes';
import { PaletteUtilsModule } from '../utils/utils.module';
import { CaseEditComponent } from '../../case-editor/case-edit/case-edit.component';
import { CaseEditPageComponent } from '../../case-editor/case-edit-page/case-edit-page.component';
import { LinkedCasesService } from './services/linked-cases.service';
import { BeforeYouStartComponent } from './components/before-you-start/before-you-start.component';
import { LinkCasesComponent } from './components/link-cases/link-cases.component';
import { CheckYourAnswersComponent } from './components/check-your-answers/check-your-answers.component';
import { WriteLinkedCasesComponent } from './components/write-linked-cases.component';
import { LinkedCasesToTableComponent } from './components/linked-cases-table/linked-cases-to-table.component';
import { LinkedCasesFromTableComponent } from './components/linked-cases-table/linked-cases-from-table.component';
import { UnLinkCasesComponent } from './components/unlink-cases/unlink-cases.component';
import { ReadLinkedCasesComponent } from './components/read-linked-cases.component';
import { CommonDataService } from '../../../services/common-data-service/common-data-service';
import { NoLinkedCasesComponent } from './components/no-linked-cases/no-linked-cases.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PipesModule,
    PaletteUtilsModule,
  ],
  providers: [
    CaseEditComponent,
    CaseEditPageComponent,
    ChangeDetectorRef as Provider,
    LinkedCasesService,
    CommonDataService
  ],
  declarations: [
    ReadCaseLinkFieldComponent,
    WriteCaseLinkFieldComponent,
    LinkedCasesToTableComponent,
    LinkedCasesFromTableComponent,
    BeforeYouStartComponent,
    LinkCasesComponent,
    CheckYourAnswersComponent,
    ReadLinkedCasesComponent,
    WriteLinkedCasesComponent,
    UnLinkCasesComponent,
    NoLinkedCasesComponent
  ],
  exports: [
    ReadCaseLinkFieldComponent,
    WriteCaseLinkFieldComponent,
    ReadLinkedCasesComponent,
    LinkedCasesToTableComponent,
    LinkedCasesFromTableComponent,
    WriteLinkedCasesComponent
  ]
})
export class CaseLinkModule {}
