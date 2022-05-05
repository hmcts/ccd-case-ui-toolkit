import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ReadLinkedCasesFieldComponent, WriteLinkedCasesFieldComponent } from '.';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [],
  declarations: [
    ReadLinkedCasesFieldComponent,
    WriteLinkedCasesFieldComponent
  ],
  exports: [
    ReadLinkedCasesFieldComponent,
    WriteLinkedCasesFieldComponent
  ]
})
export class LinkedCasesModule {}
