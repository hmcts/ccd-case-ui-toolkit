import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeleteOrCancelDialogComponent } from './delete-or-cancel-dialog';
import { DocumentDialogComponent } from './document-dialog';
import { RemoveDialogComponent } from './remove-dialog';
import { SaveOrDiscardDialogComponent } from './save-or-discard-dialog';

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
export class DialogsModule {}
