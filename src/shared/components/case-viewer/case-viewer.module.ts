import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CaseViewerComponent } from './case-viewer.component';
import { ActivityService, ActivityPollingService, OrderService, DraftService, HttpService } from '../../services';
import { ErrorsModule } from '../error/errors.module';
import { ActivityModule } from '../activity/activity.module';
import { CaseHeaderModule } from '../case-header';
import { EventTriggerModule } from '../event-trigger/event-trigger.module';
import { TabsModule } from '../../../components/tabs';
import { PaletteModule } from '../palette';
import { LabelSubstitutorModule, ConditionalShowModule } from '../../directives';
import { CasePrinterComponent, PrintUrlPipe } from './printer';
import { CaseEventTriggerComponent } from './case-event-trigger';
import { CaseHistoryComponent } from './case-history';
import { EventTriggerResolver, CaseResolver, CaseHistoryService } from './services';
import { CaseEditorModule, CaseService } from '../case-editor';
import { EventLogModule } from './event-log';
import { CaseViewComponent } from './case-view/case-view.component';
import { PipesModule, CaseReferencePipe } from '../../pipes';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ErrorsModule,
        ActivityModule,
        CaseHeaderModule,
        EventTriggerModule,
        EventLogModule,
        TabsModule,
        PaletteModule,
        LabelSubstitutorModule,
        CaseEditorModule,
        PipesModule,
        ConditionalShowModule,
    ],
    declarations: [
        CaseHistoryComponent,
        CaseEventTriggerComponent,
        CasePrinterComponent,
        CaseViewerComponent,
        CaseViewComponent,
        PrintUrlPipe,
    ],
    exports: [
        CaseViewerComponent,
        CaseViewComponent,
    ],
    providers: [
        CaseService,
        CaseReferencePipe,
        EventTriggerResolver,
        ActivityService,
        ActivityPollingService,
        OrderService,
        DraftService,
        HttpService,
        CaseResolver,
        CaseHistoryService,
    ]
})
export class CaseViewerModule {}
