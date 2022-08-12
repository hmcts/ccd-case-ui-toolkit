import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CaseHistoryModule } from '../case-history';
import { ErrorsModule } from '../error/errors.module';
import { CaseTimelineComponent } from './case-timeline.component';

@NgModule({
    imports: [
        CommonModule,
        ErrorsModule,
        FormsModule,
        ReactiveFormsModule,
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
