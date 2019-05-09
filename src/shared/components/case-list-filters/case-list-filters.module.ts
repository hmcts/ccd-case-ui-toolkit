import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaletteModule } from '../palette';
import { WorkbasketInputFilterService, OrderService, JurisdictionService, AlertService, WindowService,
    DefinitionsModule } from '../../services';
import { CaseListFiltersComponent } from './case-list-filters.component';
import { WorkbasketFiltersModule } from '../workbasket-filters';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PaletteModule,
        DefinitionsModule,
        WorkbasketFiltersModule
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
        WindowService,
    ]
})
export class CaseListFiltersModule {}
