import { CdkTreeModule } from '@angular/cdk/tree';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { CaseFileViewService } from '../../../services';
import { CaseFileViewFieldComponent } from './case-file-view-field.component';
import { CaseFileViewFolderComponent } from './components/case-file-view-folder/case-file-view-folder.component';

@NgModule({
  imports: [
    RouterModule,
    CdkTreeModule,
		MatIconModule
  ],
  declarations: [
    CaseFileViewFieldComponent,
    CaseFileViewFolderComponent
  ],
  entryComponents: [
    CaseFileViewFieldComponent
  ],
  exports: [
    CaseFileViewFieldComponent,
    CaseFileViewFolderComponent
  ],
  providers: [
    CaseFileViewService
  ]
})
export class CaseFileViewModule {}
