import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { BrowserService, SearchResultViewItemComparatorFactory } from '../../services';
import { ActivityModule } from '../activity';
import { PaginationModule } from '../pagination/pagination.module';
import { PaletteModule } from '../palette';
import { SearchResultComponent } from './search-result.component';

@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PaletteModule,
    ActivityModule,
    PaginationModule
  ],
  declarations: [
    SearchResultComponent,
  ],
  exports: [
    SearchResultComponent,
  ],
  providers: [
    SearchResultViewItemComparatorFactory,
    BrowserService
  ]
})
export class SearchResultModule {}
