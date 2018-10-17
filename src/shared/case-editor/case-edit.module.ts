import { NgModule } from '@angular/core';
import { CaseCreateComponent } from './case-create.component';
import { CaseEditComponent } from './case-edit.component';
import { CaseEditConfirmComponent } from './case-edit-confirm.component';
import { CaseEditPageComponent } from './case-edit-page.component';
import { CaseEditFormComponent } from './case-edit-form.component';
import { CaseEditSubmitComponent } from './case-edit-submit.component';
import { CallbackErrorsComponent } from '../error';
import { RouterModule } from '@angular/router';
import { CaseReferencePipe, SharedUtilsModule } from '../utils';
import { MarkdownModule } from '../markdown';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DraftService } from '../draft';

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MarkdownModule,
    SharedUtilsModule,
  ],
  declarations: [
    CaseCreateComponent,
    CaseEditComponent,
    CaseEditConfirmComponent,
    CaseEditPageComponent,
    CaseEditFormComponent,
    CaseEditSubmitComponent,
    CallbackErrorsComponent,
  ],
  exports: [
    CaseCreateComponent,
    CaseEditComponent,
    CaseEditConfirmComponent,
    CaseEditPageComponent,
    CaseEditFormComponent,
    CaseEditSubmitComponent,
    CallbackErrorsComponent,
    CaseReferencePipe,
  ],
  providers: [
    CaseReferencePipe,
    DraftService,
  ]
})
export class CaseEditModule {}
