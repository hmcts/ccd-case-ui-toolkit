import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConditionalShowModule } from '../../directives/conditional-show';
import { JurisdictionService, OrderService, SearchService, WindowService } from '../../services';
import { DefinitionsModule } from '../../services/definitions';
import { PaletteModule } from '../palette';
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
