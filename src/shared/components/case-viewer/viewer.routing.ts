import { Routes } from '@angular/router';
import { CasePrinterComponent } from './printer';
import { EventTriggerResolver } from './services';
import { CaseEventTriggerComponent } from './case-event-trigger/case-event-trigger.component';
import { editorRouting } from '../case-editor';
import { CaseHistoryComponent } from '../case-history';
import { FileUploadProgressGuard } from '../palette/document/file-upload-progress.guard';
import { EventStartGuard } from '../event-guard/event-start.guard';
import { EventStartComponent } from '../event-start/event-start.component';

export const viewerRouting: Routes = [
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
      children: editorRouting,
      canActivate: [EventStartGuard],
      canDeactivate: [FileUploadProgressGuard]
    },
    {
      path: 'eventStart',
      component: EventStartComponent
    },
    {
      path: 'event/:eid/history',
      component: CaseHistoryComponent,
    }
  ];
