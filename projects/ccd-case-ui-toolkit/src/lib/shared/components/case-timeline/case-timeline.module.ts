import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { CaseHistoryModule } from '../case-history';
import { ErrorsModule } from '../error/errors.module';
import { PaletteModule } from '../palette';
import { CaseTimelineComponent } from './case-timeline.component';

@NgModule({
    imports: [
        CommonModule,
        ErrorsModule,
        FormsModule,
        ReactiveFormsModule,
        CaseHistoryModule,
        PaletteModule,
        RpxTranslationModule.forChild()
    ],
    declarations: [
        CaseTimelineComponent
    ],
    exports: [
        CaseTimelineComponent
    ]
})

export class CaseTimelineModule {}
