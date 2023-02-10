import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultipleDemoComponent } from './multiple-demo.component';
import { CdkTableModule } from '@angular/cdk/table';
import { PaginationModule } from '../../pagination';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  imports: [
    CommonModule,
    CdkTableModule,
    PaginationModule,
    NgxPaginationModule,
    MatCheckboxModule
  ],
  declarations: [MultipleDemoComponent],
  entryComponents: [
    MultipleDemoComponent
  ]
})
export class MultipleDemoModule { }
