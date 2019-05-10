import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, SearchService, WindowService, JurisdictionService } from '../../services';
import { SearchFiltersComponent } from './search-filters.component';
import { PaletteModule } from '../palette';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DefinitionsModule } from '../../services/definitions';
import { SearchFiltersWrapperComponent } from './search-filters-wrapper.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PaletteModule,
        DefinitionsModule
    ],
    declarations: [
        SearchFiltersComponent,
        SearchFiltersWrapperComponent,
    ],
    exports: [
        SearchFiltersComponent,
        SearchFiltersWrapperComponent,
    ],
    providers: [
        SearchService,
        OrderService,
        JurisdictionService,
        WindowService,
    ]
})
export class SearchFiltersModule {}
