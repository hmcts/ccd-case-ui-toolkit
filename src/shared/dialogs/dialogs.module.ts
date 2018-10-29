import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentDialogComponent } from './document-dialog';
import { DeleteOrCancelDialogComponent } from './delete-or-cancel-dialog';
import { SaveOrDiscardDialogComponent } from './save-or-discard-dialog';
import { RemoveDialogComponent } from './remove-dialog';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    DocumentDialogComponent,
    DeleteOrCancelDialogComponent,
    SaveOrDiscardDialogComponent,
    RemoveDialogComponent,
  ],
  entryComponents: [
    DocumentDialogComponent,
    DeleteOrCancelDialogComponent,
    SaveOrDiscardDialogComponent,
    RemoveDialogComponent,
  ],
  exports: [
    DocumentDialogComponent,
    DeleteOrCancelDialogComponent,
    SaveOrDiscardDialogComponent,
    RemoveDialogComponent,
  ]
})
export class Dialogs {}
