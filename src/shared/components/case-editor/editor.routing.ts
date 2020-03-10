import { Routes } from '@angular/router';
import { CaseEditSubmitComponent } from './case-edit-submit/case-edit-submit.component';
import { CaseEditPageComponent } from './case-edit-page/case-edit-page.component';
import { CaseEditConfirmComponent } from './case-edit-confirm/case-edit-confirm.component';
import { CaseEditWizardGuard } from './services/case-edit-wizard.guard';
import { FileUploadProgressGuard } from '../palette/document/file-upload-progress.guard';

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
    canDeactivate: [FileUploadProgressGuard],
    component: CaseEditPageComponent,
  }
];
