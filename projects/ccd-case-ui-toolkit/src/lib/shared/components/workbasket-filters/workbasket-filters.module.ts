import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { ConditionalShowModule } from '../../directives/conditional-show/conditional-show.module';
import { AlertService } from '../../services/alert/alert.service';
import { JurisdictionService } from '../../services/jurisdiction/jurisdiction.service';
import { OrderService } from '../../services/order/order.service';
import { WindowService } from '../../services/window/window.service';
import { WorkbasketInputFilterService } from '../../services/workbasket/workbasket-input-filter.service';
import { PaletteModule } from '../palette/palette.module';
import { DatePickerRangeComponent } from '../palette/datetime-picker-range/date-picker-range.component';
import { WorkbasketFiltersComponent } from './workbasket-filters.component';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PaletteModule,
        ConditionalShowModule,
        RpxTranslationModule.forChild()
    ],
    declarations: [
        DatePickerRangeComponent,
        WorkbasketFiltersComponent,
    ],
    exports: [
        DatePickerRangeComponent,
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
