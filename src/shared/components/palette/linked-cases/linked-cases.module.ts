import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, NgModule, Provider } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReadLinkedCasesFieldComponent, WriteLinkedCasesFieldComponent } from '.';
import { CaseEditPageComponent } from '../../case-editor/case-edit-page/case-edit-page.component';
import { CaseEditComponent } from '../../case-editor/case-edit/case-edit.component';
import { BeforeYouStartComponent } from './components/before-you-start/before-you-start.component';
import { LinkCaseProposalComponent } from './components/link-case-proposal/link-case-proposal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    CaseEditComponent,
    CaseEditPageComponent,
    ChangeDetectorRef as Provider,
  ],
  declarations: [
    ReadLinkedCasesFieldComponent,
    WriteLinkedCasesFieldComponent,
    BeforeYouStartComponent,
    LinkCaseProposalComponent
  ],
  exports: [
    ReadLinkedCasesFieldComponent,
    WriteLinkedCasesFieldComponent
  ]
})
export class LinkedCasesModule {}
