import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConditionalShowModule } from '../../directives';
import { CaseHeaderModule } from '../case-header/case-header.module';
import { PaletteModule } from '../palette';
import { CaseHistoryComponent } from './case-history.component';
import { CaseHistoryService } from './services';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        CaseHeaderModule,
        ConditionalShowModule,
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
