import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConditionalShowModule, LabelSubstitutorModule } from '../../directives';
import { CaseHeaderModule } from '../case-header';
import { ComplexModule, PaletteModule } from '../palette';
import { CaseHistoryComponent } from './case-history.component';
import { CaseHistoryService } from './services';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        PaletteModule,
        CaseHeaderModule,
        ConditionalShowModule,
        LabelSubstitutorModule,
        ComplexModule,
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
