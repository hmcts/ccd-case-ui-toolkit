import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CaseHistoryService } from 'src/shared/components/case-history/services/case-history.service';
import { ConditionalShowModule } from '../../directives';
import { CaseHeaderModule } from '../case-header/case-header.module';
import { CaseHistoryComponent } from './case-history.component';

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
