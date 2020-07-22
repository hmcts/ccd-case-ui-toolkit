import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseListComponent } from './case-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [CaseListComponent],
  exports: [CaseListComponent]
})
export class CaseListModule { }
