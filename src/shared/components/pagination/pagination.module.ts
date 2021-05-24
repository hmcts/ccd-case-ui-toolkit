import { NgModule } from '@angular/core';
import { PaginationComponent } from './pagination.component';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule, PaginatePipe } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule
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
