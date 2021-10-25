import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { AlertModule } from '../../../components/banners/alert';
import { TabsModule } from '../../../components/tabs';
import { ConditionalShowModule, LabelSubstitutorModule } from '../../directives';
import { CaseReferencePipe, PipesModule } from '../../pipes';
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
import { CaseEditorModule, CaseNotifier } from '../case-editor';
import { CaseHeaderModule } from '../case-header';
import { CaseHistoryModule } from '../case-history';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { ErrorsModule } from '../error/errors.module';
import { EventTriggerModule } from '../event-trigger';
import { ComplexModule, EventLogModule, PaletteModule } from '../palette';
import { CaseBasicAccessViewComponent } from './case-basic-access-view/case-basic-access-view.component';
import { CaseChallengedAccessRequestComponent } from './case-challenged-access-request/case-challenged-access-request.component';
import { CaseChallengedAccessSuccessComponent } from './case-challenged-access-success/case-challenged-access-success.component';
import { CaseSpecificAccessRequestComponent } from './case-specific-access-request/case-specific-access-request.component';
import { CaseEventTriggerComponent } from './case-event-trigger';
import { CaseFullAccessViewComponent } from './case-full-access-view/case-full-access-view.component';
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
    EventTriggerModule,
    TabsModule,
    PaletteModule,
    LabelSubstitutorModule,
    CaseEditorModule,
    PipesModule,
    ConditionalShowModule,
    CaseHistoryModule,
    EventLogModule,
    MatTabsModule,
    ComplexModule,
    FormsModule,
    ReactiveFormsModule,
    AlertModule
  ],
  declarations: [
    CaseEventTriggerComponent,
    CasePrinterComponent,
    CaseViewerComponent,
    CaseBasicAccessViewComponent,
    CaseFullAccessViewComponent,
    CaseViewComponent,
    PrintUrlPipe,
    CaseChallengedAccessRequestComponent,
    CaseSpecificAccessRequestComponent,
    ErrorMessageComponent,
    CaseChallengedAccessSuccessComponent
  ],
  exports: [
    CaseViewerComponent,
    CaseViewComponent,
  ],
  providers: [
    CaseNotifier,
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
