import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CaseListComponent } from './case-list.component';
import { BrowserService } from '../../services';
import { NgxPaginationModule } from 'ngx-pagination';
import { PaginationModule } from '../pagination/pagination.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgxPaginationModule,
    PaginationModule
  ],
  declarations: [CaseListComponent],
  exports: [CaseListComponent],
  providers: [
    BrowserService
  ]
})
export class CaseListModule { }
