import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CaseViewerComponent } from './case-viewer.component';
import { MatTabsModule } from '@angular/material';
import {
  ActivityPollingService,
  ActivityService,
  DraftService,
  ErrorNotifierService,
  HttpService,
  NavigationNotifierService,
  OrderService
} from '../../services';
import { ErrorsModule } from '../error/errors.module';
import { ActivityModule } from '../activity';
import { CaseHeaderModule } from '../case-header';
import { CaseHistoryModule } from '../case-history';
import { EventTriggerModule } from '../event-trigger';
import { TabsModule } from '../../../components/tabs';
import { ComplexModule, EventLogModule, PaletteModule } from '../palette';
import { ConditionalShowModule, LabelSubstitutorModule } from '../../directives';
import { CasePrinterComponent, PrintUrlPipe } from './printer';
import { CaseEventTriggerComponent } from './case-event-trigger';
import { CaseResolver, EventTriggerResolver } from './services';
import { CaseEditorModule, CaseNotifier } from '../case-editor';
import { CaseViewComponent } from './case-view';
import { CaseReferencePipe, PipesModule } from '../../pipes';
import { CaseBasicAccessViewComponent } from './case-basic-access-view';
import { CaseFullAccessViewComponent } from './case-full-access-view';
import { AlertModule } from '../../../components';
import { CaseChallengedAccessRequestComponent } from './case-challenged-access-request/case-challenged-access-request.component';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { ReactiveFormsModule } from '@angular/forms';

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
    ErrorMessageComponent
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
