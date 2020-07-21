import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseListComponent } from './case-list.component';
import { PaletteModule } from '../palette';
import { LabelSubstitutorModule } from '../../directives';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PaletteModule,
    LabelSubstitutorModule
  ],
  declarations: [CaseListComponent],
  exports: [CaseListComponent]
})
export class CaseListModule { }
