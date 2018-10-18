import { Routes } from '@angular/router';
import { CaseEditSubmitComponent } from './case-edit-submit.component';
import { CaseEditPageComponent } from './case-edit-page.component';
import { CaseEditConfirmComponent } from './case-edit-confirm.component';
import { CaseEditWizardGuard } from './case-edit-wizard.guard';

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
