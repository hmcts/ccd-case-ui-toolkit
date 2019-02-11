import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, SearchService, WindowService, JurisdictionService } from '../../services';
import { SearchFiltersComponent } from './search-filters.component';
import { PaletteModule } from '../palette';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PaletteModule,
    ],
    declarations: [
        SearchFiltersComponent,
    ],
    exports: [
        SearchFiltersComponent,
    ],
    providers: [
        SearchService,
        OrderService,
        JurisdictionService,
        WindowService,
    ]
})
export class SearchFiltersModule {}
