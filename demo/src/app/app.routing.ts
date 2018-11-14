import { RouterModule } from '@angular/router';
import { CaseCreateConsumerComponent } from './case-create-consumer.component';
import { routing as caseEditRouting } from '@hmcts/ccd-case-ui-toolkit';
import { CaseProgressConsumerComponent } from './case-progress-consumer.component';
import { CoreComponent } from './core.component';

export const routing = RouterModule.forRoot([
  {
    path: '',
    component: CoreComponent,
    children: [
      { path: 'case/create',
        component: CaseCreateConsumerComponent,
        children: caseEditRouting
      },
      { path: 'case/progress',
        component: CaseProgressConsumerComponent,
        children: caseEditRouting
      }
    ]
  }
 ] // ,{ enableTracing: true }
)
