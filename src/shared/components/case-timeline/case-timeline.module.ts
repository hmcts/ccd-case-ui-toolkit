import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorsModule } from '../error/errors.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CaseTimelineComponent } from './case-timeline.component';
import { EventLogModule } from '../palette';

@NgModule({
    imports: [
        CommonModule,
        ErrorsModule,
        FormsModule,
        ReactiveFormsModule,
        EventLogModule,
    ],
    declarations: [
        CaseTimelineComponent
    ],
    exports: [
        CaseTimelineComponent
    ]
})

export class CaseTimelineModule {}
