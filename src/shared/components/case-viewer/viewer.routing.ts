import { Routes } from '@angular/router';
import { editorRouting } from '../case-editor';
import { CaseHistoryComponent } from '../case-history';
import { FileUploadProgressGuard } from '../palette/document/file-upload-progress.guard';
import { CaseChallengedAccessRequestComponent } from './case-challenged-access-request';
import { CaseChallengedAccessSuccessComponent } from './case-challenged-access-success';
import { CaseSpecificAccessRequestComponent } from './case-specific-access-request';
import { CaseEventTriggerComponent } from './case-event-trigger/case-event-trigger.component';
import { CasePrinterComponent } from './printer';
import { EventTriggerResolver } from './services';

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
    children: [
      {
        path: '',
        component: CaseChallengedAccessRequestComponent,
        data: {
          title: 'Request Challenged Access'
        },
        pathMatch: 'full'
      },
      {
        path: 'success',
        component: CaseChallengedAccessSuccessComponent,
        data: {
          title: 'Challenged Access Success'
        }
      }
    ]
  },
  {
    path: 'specific-access-request',
    children: [
      {
        path: '',
        component: CaseSpecificAccessRequestComponent,
        data: {
          title: 'Request Specific Access'
        },
        pathMatch: 'full'
      }
    ]
  }
];
