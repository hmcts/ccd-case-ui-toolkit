import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { BrowserService } from '../../services/browser/browser.service';
import { SearchResultViewItemComparatorFactory } from '../../services/search-result/sorting/search-result-view-item-comparator-factory';
import { ActivityModule } from '../activity/activity.module';
import { PaginationModule } from '../pagination/pagination.module';
import { PaletteModule } from '../palette/palette.module';
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
