import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { CaseFileViewService } from '../../../services';
import { CaseFileViewFieldComponent } from './case-file-view-field.component';
import { CaseFileViewIconComponent } from './components';
import { CaseFileViewFolderComponent } from './components/case-file-view-folder/case-file-view-folder.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    CdkTreeModule,
    MatIconModule
  ],
  declarations: [
    CaseFileViewFieldComponent,
    CaseFileViewFolderComponent,
    CaseFileViewIconComponent
  ],
  entryComponents: [
    CaseFileViewFieldComponent
  ],
  exports: [
    CaseFileViewFieldComponent,
    CaseFileViewFolderComponent,
    CaseFileViewIconComponent
  ],
  providers: [
    CaseFileViewService
  ]
})
export class CaseFileViewModule {}
