import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxPaginationModule, PaginatePipe } from 'ngx-pagination';
import { PaginationComponent } from './pagination.component';

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
