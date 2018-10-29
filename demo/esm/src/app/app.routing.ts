import { RouterModule } from '@angular/router';
import { CaseCreateConsumerComponent } from './case-create-consumer.component';
import { routing as caseEditorRouting } from '@hmcts/ccd-case-ui-toolkit';

export const routing = RouterModule.forRoot(
  [
    { path: '', pathMatch: 'full', redirectTo: 'create' },
    { path: 'create',
      component: CaseCreateConsumerComponent,
      children: caseEditorRouting
    }
  ]
)
