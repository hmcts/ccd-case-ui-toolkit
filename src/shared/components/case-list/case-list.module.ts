import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CaseListComponent } from './case-list.component';
import { BrowserService } from '../../services';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  declarations: [CaseListComponent],
  exports: [CaseListComponent],
  providers: [
    BrowserService
  ]
})
export class CaseListModule { }
