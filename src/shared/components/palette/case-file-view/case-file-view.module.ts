import { CdkTreeModule } from '@angular/cdk/tree';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { CaseFileViewService } from '../../../services';
import { CaseFileViewFieldComponent } from './case-file-view-field.component';
import { CaseFileViewDocumentTreeComponent } from './components/case-file-view-document-tree/case-file-view-document-tree.component';

@NgModule({
  imports: [
    RouterModule,
    CdkTreeModule,
		MatIconModule
  ],
  declarations: [
    CaseFileViewFieldComponent,
    CaseFileViewDocumentTreeComponent
  ],
  entryComponents: [
    CaseFileViewFieldComponent
  ],
  exports: [
    CaseFileViewFieldComponent,
    CaseFileViewDocumentTreeComponent
  ],
  providers: [
    CaseFileViewService
  ]
})
export class CaseFileViewModule {}
