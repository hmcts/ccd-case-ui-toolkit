import { Routes } from '@angular/router';

import { CaseEditConfirmComponent, CaseEditPageComponent, CaseEditSubmitComponent } from '.';
import { FileUploadProgressGuard } from '../palette/document/file-upload-progress.guard';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';
import { CaseEditWizardGuard } from './services';

export const editorRouting: Routes = [
  {
    path: '',
    resolve: {
      caseEditWizardGuard: CaseEditWizardGuard,
    },
    component: CaseEditPageComponent,
  },
  {
    path: 'submit',
    component: CaseEditSubmitComponent,
    canDeactivate: [UnsavedChangesGuard],
  },
  {
    path: 'confirm',
    component: CaseEditConfirmComponent,
  },
  {
    path: ':page',
    resolve: {
      caseEditWizardGuard: CaseEditWizardGuard,
    },
    canDeactivate: [FileUploadProgressGuard, UnsavedChangesGuard],
    component: CaseEditPageComponent,
  }
];
