import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentDialogComponent } from './document-dialog';
import { DeleteOrCancelDialogComponent } from './delete-or-cancel-dialog';
import { SaveOrDiscardDialogComponent } from './save-or-discard-dialog';
import { RemoveDialogComponent } from './remove-dialog';
import { JurisdictionShutteringDialogComponent } from './jurisdiction-shuttering-dialog/jurisdiction-shuttering-dialog.component';

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
    JurisdictionShutteringDialogComponent,
  ],
  entryComponents: [
    DocumentDialogComponent,
    DeleteOrCancelDialogComponent,
    SaveOrDiscardDialogComponent,
    RemoveDialogComponent,
    JurisdictionShutteringDialogComponent,
  ],
  exports: [
    DocumentDialogComponent,
    DeleteOrCancelDialogComponent,
    SaveOrDiscardDialogComponent,
    RemoveDialogComponent,
    JurisdictionShutteringDialogComponent,
  ]
})
export class DialogsModule {}
