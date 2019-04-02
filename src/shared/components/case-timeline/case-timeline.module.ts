import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorsModule } from '../error/errors.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CaseTimelineComponent } from './case-timeline.component';
import { EventLogModule } from '../palette';
import { CaseHistoryModule } from '../case-history';

@NgModule({
    imports: [
        CommonModule,
        ErrorsModule,
        FormsModule,
        ReactiveFormsModule,
        EventLogModule,
        CaseHistoryModule,
    ],
    declarations: [
        CaseTimelineComponent
    ],
    exports: [
        CaseTimelineComponent
    ]
})

export class CaseTimelineModule {}
