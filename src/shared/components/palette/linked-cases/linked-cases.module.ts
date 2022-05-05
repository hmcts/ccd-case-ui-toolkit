import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReadLinkedCasesFieldComponent, WriteLinkedCasesFieldComponent } from '.';
import { BeforeYouStartComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  declarations: [
    ReadLinkedCasesFieldComponent,
    WriteLinkedCasesFieldComponent,
    BeforeYouStartComponent
  ],
  exports: [
    ReadLinkedCasesFieldComponent,
    WriteLinkedCasesFieldComponent
  ]
})
export class LinkedCasesModule {}
