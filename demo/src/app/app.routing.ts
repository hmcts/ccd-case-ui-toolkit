import { RouterModule } from '@angular/router';
import { CaseCreateConsumerComponent } from './case-create-consumer.component';
import { editorRouting, viewerRouting } from '@hmcts/ccd-case-ui-toolkit';
import { CaseProgressConsumerComponent } from './case-progress-consumer.component';
import { CoreComponent } from './core.component';
import { CaseViewConsumerComponent } from './case-view-consumer.component';
import { CaseCreateFilterComponent } from './case-create-filter.component.';

export const routing = RouterModule.forRoot([
  {
    path: '',
    component: CoreComponent,
    children: [
      { path: 'case/create',
        component: CaseCreateConsumerComponent,
        children: editorRouting
      },
      { path: 'case/progress',
        component: CaseProgressConsumerComponent,
        children: editorRouting
      },
      { path: 'case',
        redirectTo: 'case/TEST/TestAddressBookCase/1111222233334444'
      },
      { path: 'case/:jid/:ctid/:cid',
        component: CaseViewConsumerComponent,
        children: viewerRouting
      },
      { path: 'case/filters',
        component: CaseCreateFilterComponent
      }
    ]
  }
 ]
)
