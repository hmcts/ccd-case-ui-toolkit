import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaletteModule } from '../palette';
import { CaseHistoryComponent } from './case-history.component';
import { CaseHistoryService } from './services';
import { CaseHeaderModule } from '../case-header';
import { ConditionalShowModule, LabelSubstitutorModule } from '../../directives';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        PaletteModule,
        CaseHeaderModule,
        ConditionalShowModule,
        LabelSubstitutorModule,
    ],
    declarations: [
        CaseHistoryComponent,
    ],
    providers: [
        CaseHistoryService,
    ],
    exports: [
        CaseHistoryComponent,
    ]
})
export class CaseHistoryModule {}
