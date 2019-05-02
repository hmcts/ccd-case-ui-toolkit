import { RouterModule } from '@angular/router';
import { CaseCreateConsumerComponent } from './case-create-consumer.component';
import { editorRouting, viewerRouting } from '@hmcts/ccd-case-ui-toolkit';
import { CaseProgressConsumerComponent } from './case-progress-consumer.component';
import { CoreComponent } from './core.component';
import { CaseViewConsumerComponent } from './case-view-consumer.component';
import { SearchFiltersConsumerComponent } from './search-filters-consumer.component';
import { CreateCaseFiltersConsumerComponent } from './create-case-filters-consumer.component';
import { CaseTimelineConsumerComponent } from './case-timeline-consumer.component';
import { SearchResultConsumerComponent } from './search-result-consumer.component';
import { CaseListFiltersConsumerComponent } from './case-list-filters-consumer.component';
import { WorkbasketFiltersConsumerComponent } from './workbasket-filters-consumer.component';

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
      { path: 'case/view',
        redirectTo: 'case/view/TEST/TestAddressBookCase/1111222233334444'
      },
      { path: 'case/view/:jid/:ctid/:cid',
        component: CaseViewConsumerComponent,
        children: viewerRouting
      },
      { path: 'search',
        component: SearchFiltersConsumerComponent
      },
      { path: 'case/create-filters',
        component: CreateCaseFiltersConsumerComponent
      },
      { path: 'case/timeline',
        component: CaseTimelineConsumerComponent
      },
      { path: 'case/workbasket-filters',
        component: WorkbasketFiltersConsumerComponent
      },
      { path: 'case/case-list-filters',
        component: CaseListFiltersConsumerComponent
      },
      { path: 'search/result',
        component: SearchResultConsumerComponent
      },
      { path: 'case/FR/caseType1Id/1',
        redirectTo: 'search/result'
      }
    ]
  }
 ]
)
