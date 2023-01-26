import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConditionalShowModule, LabelSubstitutorModule } from '../../directives';
import { CaseHeaderModule } from '../case-header/case-header.module';
import { PaletteModule } from '../palette';
import { CaseHistoryComponent } from './case-history.component';
import { CaseHistoryService } from './services/case-history.service';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        CaseHeaderModule,
        ConditionalShowModule,
        PaletteModule,
        LabelSubstitutorModule
    ],
    declarations: [
        CaseHistoryComponent
    ],
    providers: [
        CaseHistoryService,
    ],
    exports: [
        CaseHistoryComponent,
    ]
})
export class CaseHistoryModule {}
