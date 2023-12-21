import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PaletteModule } from '../palette';
import { CaseHeaderComponent } from './case-header.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        PaletteModule
    ],
    declarations: [
        CaseHeaderComponent,
    ],
    exports: [
        CaseHeaderComponent,
    ]
})
export class CaseHeaderModule {}
