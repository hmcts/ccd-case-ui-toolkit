import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CaseViewerComponent } from './case-viewer.component';
import { ActivityService, ActivityPollingService, OrderService, DraftService, HttpService } from '../../services';
import { ErrorsModule } from '../error/errors.module';
import { ActivityModule } from '../activity/activity.module';
import { CaseHeaderModule } from '../case-header';
import { EventTriggerModule } from '../event-trigger/event-trigger.module';
import { EventLogModule } from '../event-log';
import { TabsModule } from '../../../components/tabs';
import { PaletteModule } from '../palette';
import { LabelSubstitutorModule } from '../../directives';

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
    ],
    declarations: [
        CaseViewerComponent
    ],
    exports: [
        CaseViewerComponent,
    ],
    providers: [
        ActivityService,
        ActivityPollingService,
        OrderService,
        DraftService,
        HttpService,
    ]
})
export class CaseViewerModule {}
