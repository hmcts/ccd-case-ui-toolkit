import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkbasketFiltersComponent } from './workbasket-filters.component';
import { PaletteModule } from '../palette';
import { WorkbasketInputFilterService } from '../..';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PaletteModule,
    ],
    declarations: [
        WorkbasketFiltersComponent,
    ],
    exports: [
        WorkbasketFiltersComponent,
    ],
    providers: [
        WorkbasketInputFilterService,
    ]
})
export class WorkbasketFiltersModule {}
