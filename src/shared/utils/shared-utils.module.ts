import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseReferencePipe } from './case-reference.pipe';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    CaseReferencePipe,
  ],
  exports: [
    CaseReferencePipe,
  ]
})
export class SharedUtilsModule {}
