import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultipleDemoComponent } from './multiple-demo.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [MultipleDemoComponent],
  entryComponents: [
    MultipleDemoComponent
  ]
})
export class MultipleDemoModule { }
