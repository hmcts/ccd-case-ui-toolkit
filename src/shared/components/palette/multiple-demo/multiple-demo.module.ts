import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultipleDemoComponent } from './multiple-demo.component';
import { CdkTableModule } from '@angular/cdk/table';
import { PaginationModule } from '../../pagination';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    CdkTableModule,
    PaginationModule,
    NgxPaginationModule
  ],
  declarations: [MultipleDemoComponent],
  entryComponents: [
    MultipleDemoComponent
  ]
})
export class MultipleDemoModule { }
