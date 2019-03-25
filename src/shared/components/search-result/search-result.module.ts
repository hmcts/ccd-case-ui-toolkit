import { NgModule } from '@angular/core';
import { SearchResultComponent } from './search-result.component';
import { SearchResultViewItemComparatorFactory } from '../../services';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipesModule } from '../../pipes';
import { RouterModule } from '@angular/router';
import { PaletteModule } from '../palette';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivityModule } from '../activity';
import { LabelSubstitutorModule } from '../../directives';

@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule,
    PipesModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PaletteModule,
    ActivityModule,
    LabelSubstitutorModule
  ],
  declarations: [
    SearchResultComponent,
  ],
  exports: [
    SearchResultComponent,
  ],
  providers: [
    SearchResultViewItemComparatorFactory,
  ]
})
export class SearchResultModule {}
