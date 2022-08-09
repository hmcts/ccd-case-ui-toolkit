import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConditionalShowModule } from '../../directives/conditional-show';
import { AlertService, JurisdictionService, OrderService, WindowService, WorkbasketInputFilterService } from '../../services';
import { PaletteModule } from '../palette';
import { WorkbasketFiltersComponent } from './workbasket-filters.component';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PaletteModule,
        ConditionalShowModule
    ],
    declarations: [
        WorkbasketFiltersComponent,
    ],
    exports: [
        WorkbasketFiltersComponent,
    ],
    providers: [
        WorkbasketInputFilterService,
        OrderService,
        JurisdictionService,
        AlertService,
        WindowService,
    ]
})
export class WorkbasketFiltersModule {}
