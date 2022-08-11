import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConditionalShowModule } from '../../directives/conditional-show/conditional-show.module';
import { DefinitionsModule } from '../../services/definitions/definitions.module';
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
        DefinitionsModule,
        ConditionalShowModule
    ],
    declarations: [
        SearchFiltersComponent,
        SearchFiltersWrapperComponent
    ],
    exports: [
        SearchFiltersComponent,
        SearchFiltersWrapperComponent
    ],
    providers: [
        SearchService,
        OrderService,
        JurisdictionService,
        WindowService
    ]
})
export class SearchFiltersModule {}
