import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
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
import { CaseChallengedAccessViewComponent } from './case-challenged-access-view';
import { CaseFullAccessViewComponent } from './case-full-access-view';
import { AlertModule } from '../../../components';

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
    AlertModule
  ],
  schemas: [NO_ERRORS_SCHEMA],
  declarations: [
    CaseEventTriggerComponent,
    CasePrinterComponent,
    CaseViewerComponent,
    CaseChallengedAccessViewComponent,
    CaseFullAccessViewComponent,
    CaseViewComponent,
    PrintUrlPipe,
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
