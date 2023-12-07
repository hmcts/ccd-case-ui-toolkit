import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { ConditionalShowModule } from '../../directives/conditional-show/conditional-show.module';
import { DefinitionsService } from '../../services/definitions/definitions.service';
import { JurisdictionService } from '../../services/jurisdiction/jurisdiction.service';
import { OrderService } from '../../services/order/order.service';
import { SearchService } from '../../services/search/search.service';
import { WindowService } from '../../services/window/window.service';
import { PaletteModule } from '../palette/palette.module';

import { SearchFiltersWrapperComponent } from './search-filters-wrapper.component';
import { SearchFiltersComponent } from './search-filters.component';

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
        SearchFiltersComponent,
        SearchFiltersWrapperComponent
    ],
    exports: [
        SearchFiltersWrapperComponent
    ],
    providers: [
        SearchService,
        OrderService,
        JurisdictionService,
        DefinitionsService,
        WindowService
    ]
})
export class SearchFiltersModule {}
