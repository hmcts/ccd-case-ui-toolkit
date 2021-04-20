import { Routes } from '@angular/router';

import { FileUploadProgressGuard } from '../palette/document/file-upload-progress.guard';
import { CaseEditConfirmComponent } from './case-edit-confirm';
import { CaseEditPageComponent } from './case-edit-page';
import { CaseEditSubmitComponent } from './case-edit-submit';
import { UnsavedChangesGuard } from './guards';
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
