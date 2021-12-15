import { Routes } from '@angular/router';
import { editorRouting } from '../case-editor';
import { CaseHistoryComponent } from '../case-history';
import { FileUploadProgressGuard } from '../palette/document/file-upload-progress.guard';
import { CaseChallengedAccessRequestComponent } from './case-challenged-access-request';
import { CaseChallengedAccessSuccessComponent } from './case-challenged-access-success';
import { CaseSpecificAccessRequestComponent } from './case-specific-access-request';
import { CaseReviewSpecificAccessRequestComponent } from './case-review-specific-access-request';
import { CaseEventTriggerComponent } from './case-event-trigger/case-event-trigger.component';
import { CasePrinterComponent } from './printer';
import { EventTriggerResolver } from './services';
import { CaseReviewSpecificAccessRejectComponent } from './case-review-specific-access-reject';
import { EventStartComponent } from '../event-management/event-start/event-start.component';
import { EventStartGuard } from '../../guards/event-start.guard';

export const viewerRouting: Routes = [
  {
    path: 'print',
    component: CasePrinterComponent,
  },
  {
    path: 'trigger/:eid',
    resolve: {
      eventTrigger: EventTriggerResolver,
    },
    component: CaseEventTriggerComponent,
    children: editorRouting,
    canActivate: [EventStartGuard],
    canDeactivate: [FileUploadProgressGuard],
  },
  {
    path: 'eventStart',
    component: EventStartComponent
  },
  {
    path: 'event/:eid/history',
    component: CaseHistoryComponent,
  },
  {
    path: 'challenged-access-request',
    children: [
      {
        path: '',
        component: CaseChallengedAccessRequestComponent,
        data: {
          title: 'Request Challenged Access',
        },
        pathMatch: 'full',
      },
      {
        path: 'success',
        component: CaseChallengedAccessSuccessComponent,
        data: {
          title: 'Challenged Access Success',
        },
      },
    ],
  },
  {
    path: 'specific-access-request',
    children: [
      {
        path: '',
        component: CaseSpecificAccessRequestComponent,
        data: {
          title: 'Request Specific Access',
        },
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'review-specific-access-request',
    children: [
      {
        path: '',
        component: CaseReviewSpecificAccessRequestComponent,
        data: {
          title: 'Request Specific Access',
        },
        pathMatch: 'full',
      },
      {
        path: 'rejected',
        component: CaseReviewSpecificAccessRejectComponent,
        data: {
          title: 'Review Access Rejected'
        }
      }
    ],
  },
];
