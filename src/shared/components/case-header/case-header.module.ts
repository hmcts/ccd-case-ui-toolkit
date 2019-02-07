import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CaseHeaderComponent } from './case-header.component';
import { PaletteModule } from '../palette';
import { PipesModule } from '../../pipes';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        PaletteModule,
        PipesModule,
    ],
    declarations: [
        CaseHeaderComponent,
    ],
    exports: [
        CaseHeaderComponent,
    ]
})
export class CaseHeaderModule {}
