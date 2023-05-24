import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxPaginationModule, PaginatePipe } from 'ngx-pagination';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { PaginationComponent } from './pagination.component';

@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule,
    RpxTranslationModule.forChild()
  ],
  declarations: [
    PaginationComponent
  ],
  exports: [
    PaginationComponent,
    PaginatePipe
  ],
})
export class PaginationModule {}
