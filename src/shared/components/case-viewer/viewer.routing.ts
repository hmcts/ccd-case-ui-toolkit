import { Routes } from '@angular/router';
import { CasePrinterComponent } from './printer';
import { EventTriggerResolver } from './services';
import { CaseEventTriggerComponent } from './case-event-trigger/case-event-trigger.component';
import { editorRouting } from '../case-editor';
import { CaseHistoryComponent } from '../case-history';
import { FileUploadProgressGuard } from '../palette/document/file-upload-progress.guard';
import { CaseChallengedAccessRequestComponent } from './case-challenged-access-request';

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
      canDeactivate: [FileUploadProgressGuard]
    },
    {
      path: 'event/:eid/history',
      component: CaseHistoryComponent,
    },
    {
      path: 'access-request',
      component: CaseChallengedAccessRequestComponent
    }
  ];
