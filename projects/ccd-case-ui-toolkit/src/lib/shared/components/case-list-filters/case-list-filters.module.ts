import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { AlertService, DefinitionsModule, JurisdictionService, OrderService, WindowService,
    WorkbasketInputFilterService } from '../../services';
import { PaletteModule } from '../palette';
import { WorkbasketFiltersModule } from '../workbasket-filters';
import { CaseListFiltersComponent } from './case-list-filters.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PaletteModule,
        DefinitionsModule,
        WorkbasketFiltersModule,
        RpxTranslationModule.forChild()
    ],
    declarations: [
        CaseListFiltersComponent,
    ],
    exports: [
        CaseListFiltersComponent,
    ],
    providers: [
        WorkbasketInputFilterService,
        OrderService,
        JurisdictionService,
        AlertService,
        WindowService
    ]
})
export class CaseListFiltersModule {}
