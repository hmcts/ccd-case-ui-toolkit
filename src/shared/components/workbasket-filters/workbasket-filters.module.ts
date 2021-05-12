import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkbasketFiltersComponent } from './workbasket-filters.component';
import { PaletteModule } from '../palette';
import { WorkbasketInputFilterService, OrderService, JurisdictionService, AlertService, WindowService } from '../../services';
import { ConditionalShowModule } from '../../directives/conditional-show';
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
