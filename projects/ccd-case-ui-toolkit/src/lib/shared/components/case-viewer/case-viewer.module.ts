import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { AlertModule } from '../../../components/banners/alert/alert.module';
import { BannersModule } from '../../../components/banners/banners.module';
import { NotificationBannerModule } from '../../../components/banners/notification-banner/notification-banner.module';
import { ConditionalShowModule, LabelSubstitutorModule } from '../../directives';
import { CaseReferencePipe } from '../../pipes';
import {
  ActivityPollingService,
  ActivityService,
  DraftService,
  ErrorNotifierService,
  HttpService,
  NavigationNotifierService,
  OrderService
} from '../../services';
import { ActivityModule } from '../activity';
import { CaseEditorModule, CaseNotifier, ConvertHrefToRouterService } from '../case-editor';
import { CaseHeaderModule } from '../case-header';
import { CaseHistoryModule } from '../case-history';
import { EventMessageModule } from '../error-message/error-message.module';
import { ErrorsModule } from '../error/errors.module';
import { EventStartModule } from '../event-start/event-start.module';
import { EventTriggerModule } from '../event-trigger';
import { LoadingSpinnerModule } from '../loading-spinner/loading-spinner.module';
import { PaletteModule } from '../palette';
import { CaseBasicAccessViewComponent } from './case-basic-access-view';
import { CaseChallengedAccessRequestComponent } from './case-challenged-access-request/case-challenged-access-request.component';
import { CaseChallengedAccessSuccessComponent } from './case-challenged-access-success/case-challenged-access-success.component';
import { CaseEventTriggerComponent } from './case-event-trigger';
import { CaseFullAccessViewComponent } from './case-full-access-view/case-full-access-view.component';
import { CaseReviewSpecificAccessRejectComponent } from './case-review-specific-access-reject';
import { CaseReviewSpecificAccessRequestComponent } from './case-review-specific-access-request/case-review-specific-access-request.component';
import { CaseSpecificAccessRequestComponent } from './case-specific-access-request/case-specific-access-request.component';
import { CaseSpecificAccessSuccessComponent } from './case-specific-access-success/case-specific-access-success.component';
import { CaseViewComponent } from './case-view';
import { CaseViewerComponent } from './case-viewer.component';
import { CasePrinterComponent, PrintUrlPipe } from './printer';
import { CaseResolver, EventTriggerResolver } from './services';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ErrorsModule,
    ActivityModule,
    CaseHeaderModule,
    EventStartModule,
    EventTriggerModule,
    PaletteModule,
    CaseEditorModule,
    ConditionalShowModule,
    CaseHistoryModule,
    MatTabsModule,
    ReactiveFormsModule,
    BannersModule,
    LabelSubstitutorModule,
    LoadingSpinnerModule,
    EventMessageModule
  ],
  declarations: [
    CaseEventTriggerComponent,
    CasePrinterComponent,
    CaseViewerComponent,
    CaseFullAccessViewComponent,
    CaseViewComponent,
    CaseBasicAccessViewComponent,
    PrintUrlPipe,
    CaseChallengedAccessRequestComponent,
    CaseSpecificAccessRequestComponent,
    CaseReviewSpecificAccessRequestComponent,
    CaseChallengedAccessSuccessComponent,
    CaseSpecificAccessSuccessComponent,
    CaseReviewSpecificAccessRejectComponent
  ],
  exports: [
    CaseViewerComponent,
    CaseViewComponent
  ],
  providers: [
    CaseNotifier,
    ConvertHrefToRouterService,
    NavigationNotifierService,
    CaseReferencePipe,
    EventTriggerResolver,
    ActivityService,
    ActivityPollingService,
    OrderService,
    DraftService,
    HttpService,
    CaseResolver,
    ErrorNotifierService,
  ]
})
export class CaseViewerModule {
}
