import { Routes } from '@angular/router';
import { CaseViewerComponent } from './case-viewer.component';
import { CasePrinterComponent } from './printer';
import { EventTriggerResolver } from './services';
import { CaseEventTriggerComponent } from './case-event-trigger/case-event-trigger.component';
import { editorRouting } from '../case-editor';
import { CaseHistoryComponent } from '../case-history';

export const viewerRouting: Routes = [
    {
      path: '',
      component: CaseViewerComponent,
    },
    {
      path: 'print',
      component: CasePrinterComponent,
    },
    {
      path: 'trigger/:eid',
      resolve: {
        eventTrigger: EventTriggerResolver
      },
      component: CaseEventTriggerComponent,
      children: editorRouting
    },
    {
      path: 'event/:eid/history',
      component: CaseHistoryComponent,
    }
  ];
