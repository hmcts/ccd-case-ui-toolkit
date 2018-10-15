import { Routes } from '@angular/router';
import { CaseEditSubmitComponent } from './shared/case-editor/case-edit-submit.component';
import { CaseEditPageComponent } from './shared/case-editor/case-edit-page.component';
import { CaseEditConfirmComponent } from './shared/case-editor/case-edit-confirm.component';
import { CaseEditWizardGuard } from './shared/case-editor/case-edit-wizard.guard';

export const routing: Routes = [
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
    component: CaseEditPageComponent,
  }
];
