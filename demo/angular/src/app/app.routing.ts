import { RouterModule } from '@angular/router';
import { CaseCreateConsumerComponent } from './case-create-consumer.component';
import { routing as caseEditRouting } from '@hmcts/ccd-case-ui-toolkit';
import { CaseCreatorComponent } from './case-creator.component';

export const routing = RouterModule.forRoot(
  [
    { path: '', pathMatch: 'full', redirectTo: 'create' },
    { path: 'create',
      component: CaseCreateConsumerComponent,
      // resolve: {
      //   eventTrigger: CreateCaseEventTriggerResolver
      // },
      children: [
        {
          path: ':jid/:ctid/:eid',
          component: CaseCreatorComponent,
          children: caseEditRouting
        },
      ]
    }
  ],
  { enableTracing: true }
)
